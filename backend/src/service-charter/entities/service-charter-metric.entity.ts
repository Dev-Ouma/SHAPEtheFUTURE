import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service_charter_metrics')
export class ServiceCharterMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // avg_response_time, complaints_resolved, requests_processed, satisfaction_rate

  @Column()
  label: string;

  @Column()
  value: string; // e.g. "4.2 hrs", "98.4%", "12,847", "91%"

  @Column({ nullable: true })
  sub_label: string;

  @Column({ nullable: true })
  icon: string; // lucide icon name

  @Column({ default: 0 })
  display_order: number;

  @UpdateDateColumn()
  updated_at: Date;
}
