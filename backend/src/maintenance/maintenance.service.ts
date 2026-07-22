import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MaintenanceSetting,
  MaintenanceMode,
} from './entities/maintenance-setting.entity';
import { MaintenanceModule as MaintenanceAllowedModule } from './entities/maintenance-module.entity';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  /** Short process-local cache — /status is hit by every public middleware request. */
  private statusCache: {
    value: Record<string, unknown>;
    expiresAt: number;
  } | null = null;
  private static readonly STATUS_TTL_MS = 15_000;

  constructor(
    @InjectRepository(MaintenanceSetting)
    private readonly settingRepo: Repository<MaintenanceSetting>,
    @InjectRepository(MaintenanceAllowedModule)
    private readonly moduleRepo: Repository<MaintenanceAllowedModule>,
  ) {}

  private invalidateStatusCache() {
    this.statusCache = null;
  }

  async onModuleInit() {
    // Ensure the singleton row exists
    const count = await this.settingRepo.count();
    if (count === 0) {
      await this.settingRepo.save(
        this.settingRepo.create({
          id: 'singleton',
          mode: MaintenanceMode.LIVE,
        }),
      );
    }
  }

  async getSettings() {
    let setting = await this.settingRepo.findOne({
      where: { id: 'singleton' },
    });
    if (!setting) {
      setting = await this.settingRepo.save(
        this.settingRepo.create({
          id: 'singleton',
          mode: MaintenanceMode.LIVE,
        }),
      );
    }
    const modules = await this.moduleRepo.find();

    return {
      ...setting,
      allowed_modules: modules.filter((m) => m.is_allowed).map((m) => m.name),
      all_modules: modules,
    };
  }

  async updateSettings(dto: UpdateMaintenanceDto) {
    let setting = await this.settingRepo.findOne({
      where: { id: 'singleton' },
    });
    if (!setting) {
      setting = this.settingRepo.create({
        id: 'singleton',
        mode: MaintenanceMode.LIVE,
      });
    }

    if (dto.is_emergency) {
      setting.mode = MaintenanceMode.FULL;
      setting.message = 'Emergency Lockdown Activated.';
      setting.starts_at = null;
      setting.ends_at = null;
      setting.is_emergency = true;
    } else {
      setting.mode = dto.mode;
      setting.message =
        dto.message !== undefined ? dto.message : setting.message;
      setting.starts_at = dto.starts_at ? new Date(dto.starts_at) : null;
      setting.ends_at = dto.ends_at ? new Date(dto.ends_at) : null;
      setting.is_emergency = false;
    }

    await this.settingRepo.save(setting);

    // Update modules if provided
    if (dto.allowed_modules) {
      // Reset all to false first
      await this.moduleRepo
        .createQueryBuilder()
        .update(MaintenanceAllowedModule)
        .set({ is_allowed: false })
        .execute();

      // Set specified to true
      for (const modName of dto.allowed_modules) {
        let mod = await this.moduleRepo.findOne({ where: { name: modName } });
        if (!mod) {
          mod = this.moduleRepo.create({ name: modName });
        }
        mod.is_allowed = true;
        await this.moduleRepo.save(mod);
      }
    }

    this.invalidateStatusCache();
    return this.getSettings();
  }

  async getStatus() {
    const nowMs = Date.now();
    if (this.statusCache && this.statusCache.expiresAt > nowMs) {
      return this.statusCache.value;
    }

    const setting = await this.settingRepo.findOne({
      where: { id: 'singleton' },
    });
    if (!setting) {
      const live = {
        mode: MaintenanceMode.LIVE,
        allowed_modules: [] as string[],
      };
      this.statusCache = {
        value: live,
        expiresAt: nowMs + MaintenanceService.STATUS_TTL_MS,
      };
      return live;
    }

    const modules = await this.moduleRepo.find({ where: { is_allowed: true } });

    let effectiveMode = setting.mode;

    // Evaluate Schedule
    if (setting.starts_at && setting.ends_at) {
      const now = new Date();
      if (now < setting.starts_at || now > setting.ends_at) {
        // If outside the scheduled window, force LIVE mode
        effectiveMode = MaintenanceMode.LIVE;
      }
    }

    const status = {
      mode: effectiveMode,
      message: setting.message,
      allowed_modules: modules.map((m) => m.name),
      starts_at: setting.starts_at,
      ends_at: setting.ends_at,
      is_emergency: setting.is_emergency,
    };

    this.statusCache = {
      value: status,
      expiresAt: nowMs + MaintenanceService.STATUS_TTL_MS,
    };
    return status;
  }

  // Run every minute to check schedule and clean up expired schedules
  @Cron(CronExpression.EVERY_MINUTE)
  async checkScheduledMaintenance() {
    const setting = await this.settingRepo.findOne({
      where: { id: 'singleton' },
    });

    if (!setting || !setting.starts_at || !setting.ends_at) return;

    const now = new Date();

    // Auto-deactivate and clean up if we are past the window
    if (now > setting.ends_at) {
      this.logger.log(
        'Scheduled maintenance window ended. Reverting to LIVE mode.',
      );
      setting.mode = MaintenanceMode.LIVE;
      setting.starts_at = null;
      setting.ends_at = null;
      await this.settingRepo.save(setting);
      this.invalidateStatusCache();
    }
  }
}
