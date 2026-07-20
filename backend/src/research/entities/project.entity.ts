import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { School } from '../../programs/entities/school.entity';
import { Department } from '../../programs/entities/department.entity';
import { ResearchProgramme } from './research-programme.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

@Entity('research_projects')
export class ResearchProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ONGOING,
  })
  status: ProjectStatus;

  @ManyToMany(() => StaffMember)
  @JoinTable({
    name: 'project_personnel',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'staff_id', referencedColumnName: 'id' },
  })
  personnel: StaffMember[];

  @ManyToOne(() => StaffMember, { nullable: true })
  @JoinColumn({ name: 'principal_investigator_id' })
  principal_investigator: StaffMember;

  // Classification
  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Timeline & Funding
  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({ nullable: true })
  funder: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  external_partners: string;

  @Column('simple-array', { nullable: true })
  keywords: string[];

  // Media
  @Column({ nullable: true })
  banner_image_url: string;

  @Column({ nullable: true })
  website_url: string;

  // Status
  @Column({ default: 'Published' })
  status_visibility: string; // Draft / Published

  @ManyToOne(() => ResearchProgramme, (programme) => programme.projects, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'programme_id' })
  programme: ResearchProgramme;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
