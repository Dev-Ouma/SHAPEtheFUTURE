import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IctIncident } from './ict-incident.entity';

export enum IctSystemStatus {
  OPERATIONAL = 'Operational',
  DEGRADED = 'Degraded',
  PARTIAL_OUTAGE = 'Partial Outage',
  MAJOR_OUTAGE = 'Major Outage',
  MAINTENANCE = 'Maintenance',
}

// A monitored institutional system/service shown on the status board
// (e.g. LMS, Email, Student Portal, Network, Website).
@Entity('ict_systems')
export class IctSystem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Grouping label, e.g. Academic, Infrastructure, Communication.
  @Column({ nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: IctSystemStatus,
    default: IctSystemStatus.OPERATIONAL,
  })
  status: IctSystemStatus;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => IctIncident, (incident) => incident.system)
  incidents: IctIncident[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
