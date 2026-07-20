import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('analytics_metrics')
export class AnalyticsMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  @Column()
  type: string; // 'VISIT', 'CLICK', 'INTERACTION', 'HEARTBEAT'

  @Column()
  path: string; // The URL path

  @Column({ nullable: true })
  label: string; // E.g., 'Hero CTA', 'Apply Button'

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    browser?: string;
    os?: string;
    device?: string;
    region?: string;
    country?: string;
    referrer?: string;
    screen_size?: string;
    ip_hash?: string; // Anonymized IP
    session_id?: string;
    duration_ms?: number;
  };

  @Column({ nullable: true })
  user_id: string; // If authenticated
}
