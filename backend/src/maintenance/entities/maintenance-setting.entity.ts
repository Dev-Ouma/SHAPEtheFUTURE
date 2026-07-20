import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

export enum MaintenanceMode {
  LIVE = 'LIVE',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}

@Entity('maintenance_settings')
export class MaintenanceSetting {
  @PrimaryColumn({ default: 'singleton' })
  id: string;

  @Column({
    type: 'enum',
    enum: MaintenanceMode,
    default: MaintenanceMode.LIVE,
  })
  mode: MaintenanceMode;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'timestamp', nullable: true })
  starts_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date | null;

  @Column({ default: false })
  is_emergency: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
