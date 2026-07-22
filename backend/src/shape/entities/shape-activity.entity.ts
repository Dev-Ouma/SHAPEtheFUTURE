import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkPackage } from './work-package.entity';

export type ShapeActivityStatus =
  | 'completed'
  | 'in_progress'
  | 'planned'
  | 'delayed';

@Entity('shape_activities')
export class ShapeActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  title_sw: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string | null;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'varchar', default: 'planned' })
  status: ShapeActivityStatus;

  @Column({ nullable: true })
  work_package_id: string | null;

  @ManyToOne(() => WorkPackage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'work_package_id' })
  work_package: WorkPackage;

  @Column({ type: 'int', default: 0 })
  progress_percent: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
