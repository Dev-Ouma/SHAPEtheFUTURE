import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Division } from './division.entity';
import { JobCategory } from './job-category.entity';
import { JobSpecialization } from './job-specialization.entity';
import { Department } from '../../programs/entities/department.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  reference_code: string;

  @Column('text')
  summary: string;

  @Column({ type: 'text', nullable: true })
  summary_sw: string;

  @Column('text')
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  // Classification (Relations)
  @ManyToOne(() => Division, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'division_id' })
  division: Division;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => JobCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'job_category_id' })
  job_category: JobCategory;

  @ManyToMany(() => JobSpecialization)
  @JoinTable({
    name: 'job_specializations_mapping',
    joinColumn: { name: 'job_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'specialization_id',
      referencedColumnName: 'id',
    },
  })
  specializations: JobSpecialization[];

  // Job Details
  @Column({ nullable: true })
  employment_type: string;

  @Column({ nullable: true })
  experience_level: string;

  @Column({ nullable: true })
  job_grade: string;

  @Column({ type: 'int', default: 1 })
  positions_available: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  is_remote: boolean;

  // Content Sections
  @Column('text', { nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  responsibilities_sw: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  requirements_sw: string;

  @Column('text', { nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  qualifications_sw: string;

  @Column('text', { nullable: true })
  benefits: string;

  @Column({ type: 'text', nullable: true })
  benefits_sw: string;

  @Column('text', { nullable: true })
  additional_notes: string;

  @Column({ type: 'text', nullable: true })
  additional_notes_sw: string;

  // Application Settings
  @Column({ type: 'timestamp', nullable: true })
  application_deadline: Date;

  @Column({ default: 'external' })
  application_method: string;

  @Column({ nullable: true })
  application_url: string;

  // Status & Visibility
  @Column({ default: 'Draft' })
  status: string; // Draft / Published / Closed

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Synthetic/Exposed property for calculating remaining days (Not an actual column)
  days_remaining?: number;
}
