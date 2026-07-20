import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { School } from '../../programs/entities/school.entity';
import { Department } from '../../programs/entities/department.entity';
import { ResearchProject } from './project.entity';
import { Publication } from './publication.entity';

export enum ResearchProgrammeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PLANNED = 'planned',
  ARCHIVED = 'archived',
}

@Entity('research_programmes')
export class ResearchProgramme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  overview: string;

  @Column('text', { nullable: true })
  summary: string;

  @Column({
    type: 'enum',
    enum: ResearchProgrammeStatus,
    default: ResearchProgrammeStatus.ACTIVE,
  })
  status: ResearchProgrammeStatus;

  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @ManyToOne(() => StaffMember, { nullable: true })
  @JoinColumn({ name: 'lead_researcher_id' })
  lead_researcher: StaffMember;

  @ManyToMany(() => StaffMember)
  @JoinTable({
    name: 'research_programme_team',
    joinColumn: { name: 'programme_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'staff_id', referencedColumnName: 'id' },
  })
  team_members: StaffMember[];

  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => ResearchProject, (project) => project.programme)
  projects: ResearchProject[];

  @OneToMany(() => Publication, (publication) => publication.programme)
  publications: Publication[];

  @Column({ nullable: true })
  funding_source: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  grant_amount: number;

  @Column('text', { nullable: true })
  partners: string;

  @Column('text', { nullable: true })
  objectives: string;

  @Column('text', { nullable: true })
  methodology: string;

  @Column('text', { nullable: true })
  expected_outcomes: string;

  @Column('text', { nullable: true })
  impact: string;

  @Column({ nullable: true })
  cover_image_url: string;

  // SEO Fields
  @Column({ nullable: true })
  meta_title: string;

  @Column('text', { nullable: true })
  meta_description: string;

  @Column({ default: 'Published' })
  status_visibility: string; // Draft / Published

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
