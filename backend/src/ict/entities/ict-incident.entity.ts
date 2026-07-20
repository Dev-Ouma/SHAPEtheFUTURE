import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IctSystem } from './ict-system.entity';
import { User } from '../../auth/entities/user.entity';

export enum IncidentType {
  INCIDENT = 'Incident',
  MAINTENANCE = 'Maintenance',
}

export enum IncidentImpact {
  MINOR = 'Minor',
  MAJOR = 'Major',
  CRITICAL = 'Critical',
  MAINTENANCE = 'Maintenance',
}

export enum IncidentStatus {
  // Incident lifecycle
  INVESTIGATING = 'Investigating',
  IDENTIFIED = 'Identified',
  MONITORING = 'Monitoring',
  RESOLVED = 'Resolved',
  // Maintenance lifecycle
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

// A single timeline update appended to an incident/maintenance window.
export interface IncidentUpdate {
  status: string;
  message: string;
  timestamp: string;
  author?: string;
}

@Entity('ict_incidents')
export class IctIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IctSystem, (system) => system.incidents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'system_id' })
  system: IctSystem;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
    default: IncidentType.INCIDENT,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentImpact,
    default: IncidentImpact.MINOR,
  })
  impact: IncidentImpact;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.INVESTIGATING,
  })
  status: IncidentStatus;

  @Column({ type: 'timestamp', nullable: true })
  starts_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date;

  @Column('jsonb', { nullable: true, default: [] })
  updates: IncidentUpdate[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
