import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CampusFeedback } from './campus-feedback.entity';
import { Department } from '../../programs/entities/department.entity';

@Entity('campus_feedback_categories')
export class CampusFeedbackCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_infrastructure: boolean;

  @Column('jsonb', { nullable: true })
  applicable_types: string[];

  @Column('jsonb', { nullable: true, default: [] })
  subcategories: string[];

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => CampusFeedback, (f) => f.category)
  feedback_items: CampusFeedback[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
