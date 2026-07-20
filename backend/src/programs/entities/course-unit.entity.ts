import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Program } from './program.entity';
import { School } from './school.entity';

export enum StudyLevel {
  CERTIFICATE = 'Certificate',
  DIPLOMA = 'Diploma',
  UNDERGRADUATE = 'Undergraduate',
  POSTGRADUATE = 'Postgraduate',
}

export enum CourseUnitStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

@Entity('course_units')
export class CourseUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  unit_code: string;

  @Index()
  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string; // Swahili translation

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  description_sw: string; // Swahili description

  @Column({ nullable: true })
  credits: number;

  @Column({ nullable: true })
  year_level: string; // e.g., 'Year 1', 'Year 2', 'Semester 1'

  @Column({ nullable: true })
  department: string;

  @Column({
    type: 'enum',
    enum: StudyLevel,
    nullable: true,
  })
  study_level: StudyLevel;

  @Column({
    type: 'enum',
    enum: CourseUnitStatus,
    default: CourseUnitStatus.DRAFT,
  })
  status: CourseUnitStatus;

  @Column({ default: 'English' })
  language: string; // 'English' | 'Swahili' | 'Bilingual'

  @Column('text', { nullable: true })
  learning_outcomes: string;

  @Column('text', { nullable: true })
  assessment_methods: string;

  @Column('text', { nullable: true })
  prerequisites: string;

  // Primary program relationship (backwards compatible)
  @ManyToOne(() => Program, (program) => program.units, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  program: Program;

  // Reusable across multiple programmes
  @ManyToMany(() => Program, { nullable: true })
  @JoinTable({ name: 'course_unit_programmes' })
  programmes: Program[];

  // School/Faculty
  @ManyToOne(() => School, { nullable: true, eager: true })
  school: School;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
