import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { IctSystem, IctSystemStatus } from './entities/ict-system.entity';
import {
  IctIncident,
  IncidentType,
  IncidentImpact,
  IncidentStatus,
  IncidentUpdate,
} from './entities/ict-incident.entity';
import { User } from '../auth/entities/user.entity';
import {
  CreateSystemDto,
  UpdateSystemDto,
  UpdateSystemStatusDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  AddIncidentUpdateDto,
} from './dto/ict-status.dto';

const RESOLVED_STATES = [IncidentStatus.RESOLVED, IncidentStatus.COMPLETED];

// Severity ranking used to derive the overall board status from member systems.
const STATUS_SEVERITY: Record<string, number> = {
  [IctSystemStatus.OPERATIONAL]: 0,
  [IctSystemStatus.MAINTENANCE]: 1,
  [IctSystemStatus.DEGRADED]: 2,
  [IctSystemStatus.PARTIAL_OUTAGE]: 3,
  [IctSystemStatus.MAJOR_OUTAGE]: 4,
};

@Injectable()
export class IctStatusService {
  constructor(
    @InjectRepository(IctSystem)
    private systemsRepo: Repository<IctSystem>,
    @InjectRepository(IctIncident)
    private incidentsRepo: Repository<IctIncident>,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  // Same backend infrastructure metrics the admin Observability page reads (/health/detailed),
  // exposed here so ICT officers see them on the status board under ict_status.
  async getInfraHealth() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk_space', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          threshold: 5 * 1024 * 1024 * 1024,
        }),
    ]);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private overallStatus(systems: IctSystem[]): string {
    if (!systems.length) return IctSystemStatus.OPERATIONAL;
    const worst = systems.reduce(
      (max, s) => Math.max(max, STATUS_SEVERITY[s.status] ?? 0),
      0,
    );
    const entry = Object.entries(STATUS_SEVERITY).find(([, v]) => v === worst);
    return entry ? entry[0] : IctSystemStatus.OPERATIONAL;
  }

  // ─── Public board ────────────────────────────────────────────────────────

  async getBoard() {
    const systems = await this.systemsRepo.find({
      where: { is_active: true },
      order: { order: 'ASC', name: 'ASC' },
    });

    const activeIncidents = await this.incidentsRepo.find({
      where: { status: Not(In(RESOLVED_STATES)) },
      relations: ['system'],
      order: { created_at: 'DESC' },
    });

    const now = new Date();
    const upcomingMaintenance = activeIncidents.filter(
      (i) =>
        i.type === IncidentType.MAINTENANCE &&
        (!i.starts_at || new Date(i.starts_at) > now),
    );
    const activeOutages = activeIncidents.filter(
      (i) =>
        !(
          i.type === IncidentType.MAINTENANCE &&
          (!i.starts_at || new Date(i.starts_at) > now)
        ),
    );

    const recentlyResolved = await this.incidentsRepo.find({
      where: { status: In(RESOLVED_STATES) },
      relations: ['system'],
      order: { updated_at: 'DESC' },
      take: 5,
    });

    return {
      overall_status: this.overallStatus(systems),
      updated_at: now,
      systems,
      active_incidents: activeOutages,
      upcoming_maintenance: upcomingMaintenance,
      recently_resolved: recentlyResolved,
    };
  }

  // ─── Systems ─────────────────────────────────────────────────────────────

  async findAllSystems(): Promise<IctSystem[]> {
    return this.systemsRepo.find({ order: { order: 'ASC', name: 'ASC' } });
  }

  async createSystem(dto: CreateSystemDto): Promise<IctSystem> {
    const system = this.systemsRepo.create({
      name: dto.name,
      slug: this.slugify(dto.name),
      description: dto.description,
      category: dto.category,
      status: (dto.status as IctSystemStatus) || IctSystemStatus.OPERATIONAL,
      order: dto.order ?? 0,
      is_active: dto.is_active ?? true,
    });
    return this.systemsRepo.save(system);
  }

  async updateSystem(id: string, dto: UpdateSystemDto): Promise<IctSystem> {
    const system = await this.systemsRepo.findOne({ where: { id } });
    if (!system) throw new NotFoundException('System not found');
    if (dto.name && dto.name !== system.name) {
      system.name = dto.name;
      system.slug = this.slugify(dto.name);
    }
    if (dto.description !== undefined) system.description = dto.description;
    if (dto.category !== undefined) system.category = dto.category;
    if (dto.status) system.status = dto.status as IctSystemStatus;
    if (dto.order !== undefined) system.order = dto.order;
    if (dto.is_active !== undefined) system.is_active = dto.is_active;
    return this.systemsRepo.save(system);
  }

  async setSystemStatus(
    id: string,
    dto: UpdateSystemStatusDto,
  ): Promise<IctSystem> {
    const system = await this.systemsRepo.findOne({ where: { id } });
    if (!system) throw new NotFoundException('System not found');
    system.status = dto.status as IctSystemStatus;
    return this.systemsRepo.save(system);
  }

  async deleteSystem(id: string): Promise<{ deleted: boolean }> {
    await this.systemsRepo.delete(id);
    return { deleted: true };
  }

  // ─── Incidents ───────────────────────────────────────────────────────────

  async findAllIncidents(): Promise<IctIncident[]> {
    return this.incidentsRepo.find({
      relations: ['system'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneIncident(id: string): Promise<IctIncident> {
    const incident = await this.incidentsRepo.findOne({
      where: { id },
      relations: ['system', 'created_by'],
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async createIncident(
    dto: CreateIncidentDto,
    actorId?: string,
  ): Promise<IctIncident> {
    const type = (dto.type as IncidentType) || IncidentType.INCIDENT;
    const defaultStatus =
      type === IncidentType.MAINTENANCE
        ? IncidentStatus.SCHEDULED
        : IncidentStatus.INVESTIGATING;
    const status = (dto.status as IncidentStatus) || defaultStatus;

    const firstUpdate: IncidentUpdate | null = dto.message
      ? { status, message: dto.message, timestamp: new Date().toISOString() }
      : null;

    const incident = this.incidentsRepo.create({
      title: dto.title,
      type,
      impact:
        (dto.impact as IncidentImpact) ||
        (type === IncidentType.MAINTENANCE
          ? IncidentImpact.MAINTENANCE
          : IncidentImpact.MINOR),
      status,
      system: dto.system_id ? ({ id: dto.system_id } as IctSystem) : undefined,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : undefined,
      ends_at: dto.ends_at ? new Date(dto.ends_at) : undefined,
      updates: firstUpdate ? [firstUpdate] : [],
      created_by: actorId ? ({ id: actorId } as User) : undefined,
    });
    const saved = await this.incidentsRepo.save(incident);

    if (dto.system_id && dto.system_status) {
      await this.systemsRepo.update(dto.system_id, {
        status: dto.system_status as IctSystemStatus,
      });
    }

    return this.findOneIncident(saved.id);
  }

  async updateIncident(
    id: string,
    dto: UpdateIncidentDto,
  ): Promise<IctIncident> {
    const incident = await this.findOneIncident(id);
    if (dto.title !== undefined) incident.title = dto.title;
    if (dto.type) incident.type = dto.type as IncidentType;
    if (dto.impact) incident.impact = dto.impact as IncidentImpact;
    if (dto.status) incident.status = dto.status as IncidentStatus;
    if (dto.starts_at !== undefined)
      incident.starts_at = dto.starts_at
        ? new Date(dto.starts_at)
        : (null as any);
    if (dto.ends_at !== undefined)
      incident.ends_at = dto.ends_at ? new Date(dto.ends_at) : (null as any);
    if (dto.system_id !== undefined)
      incident.system = dto.system_id
        ? ({ id: dto.system_id } as IctSystem)
        : (null as any);
    return this.incidentsRepo.save(incident);
  }

  async addUpdate(
    id: string,
    dto: AddIncidentUpdateDto,
    actorName?: string,
  ): Promise<IctIncident> {
    const incident = await this.findOneIncident(id);
    const newStatus = (dto.status as IncidentStatus) || incident.status;

    const entry: IncidentUpdate = {
      status: newStatus,
      message: dto.message,
      timestamp: new Date().toISOString(),
      author: actorName,
    };
    incident.updates = [...(incident.updates || []), entry];
    incident.status = newStatus;

    if (RESOLVED_STATES.includes(newStatus) && !incident.ends_at) {
      incident.ends_at = new Date();
    }

    const saved = await this.incidentsRepo.save(incident);

    // Optionally roll the affected system's status forward (e.g. back to Operational on resolve).
    if (incident.system && dto.system_status) {
      await this.systemsRepo.update(incident.system.id, {
        status: dto.system_status as IctSystemStatus,
      });
    }

    return this.findOneIncident(saved.id);
  }

  async deleteIncident(id: string): Promise<{ deleted: boolean }> {
    await this.incidentsRepo.delete(id);
    return { deleted: true };
  }
}
