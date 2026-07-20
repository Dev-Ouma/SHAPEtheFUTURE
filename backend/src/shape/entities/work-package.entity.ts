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

export type WorkPackageStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'at_risk';

@Entity('shape_work_packages')
export class WorkPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ nullable: true })
  leader_partner_id: string | null;

  @ManyToOne(() => PartnerInstitution, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leader_partner_id' })
  leader_partner: PartnerInstitution;

  @Column({ type: 'simple-json', nullable: true })
  partner_ids: string[];

  @Column({ type: 'date', nullable: true })
  start_date: string | null;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  @Column({ type: 'int', default: 0 })
  progress_percent: number;

  @Column({ type: 'varchar', default: 'not_started' })
  status: WorkPackageStatus;

  @Column({ type: 'text', nullable: true })
  milestones: string;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
