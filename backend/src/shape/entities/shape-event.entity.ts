import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PartnerInstitution } from './partner-institution.entity';
import { WorkPackage } from './work-package.entity';

export type ShapeEventStatus =
  | 'planned'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

@Entity('shape_events')
export class ShapeEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  event_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  host_partner_id: string | null;

  @ManyToOne(() => PartnerInstitution, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'host_partner_id' })
  host_partner: PartnerInstitution;

  @Column({ type: 'varchar', default: 'planned' })
  status: ShapeEventStatus;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ nullable: true })
  minutes_url: string;

  @Column({ nullable: true })
  presentations_url: string;

  @Column({ type: 'text', nullable: true })
  attendance_notes: string;

  @Column({ type: 'text', nullable: true })
  outcomes: string;

  @Column({ type: 'simple-json', nullable: true })
  gallery_urls: string[];

  @Column({ nullable: true })
  work_package_id: string | null;

  @ManyToOne(() => WorkPackage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'work_package_id' })
  work_package: WorkPackage;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
