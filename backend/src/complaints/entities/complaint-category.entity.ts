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
import { Complaint } from './complaint.entity';
import { Department } from '../../programs/entities/department.entity';

@Entity('complaint_categories')
export class ComplaintCategory {
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

  // Which complaint types this category applies to: ['External','Student','Staff'] or null = all
  @Column('jsonb', { nullable: true })
  applicable_types: string[];

  // Subcategories (free-text list)
  @Column('jsonb', { nullable: true, default: [] })
  subcategories: string[];

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Complaint, (complaint) => complaint.category)
  complaints: Complaint[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
