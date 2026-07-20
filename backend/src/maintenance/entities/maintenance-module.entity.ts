import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('maintenance_allowed_modules')
export class MaintenanceModule {
  @PrimaryColumn()
  name: string; // e.g. 'research', 'programmes'

  @Column({ default: false })
  is_allowed: boolean;
}
