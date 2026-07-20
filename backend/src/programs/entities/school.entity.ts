import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Department } from './department.entity';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { ResearchProject } from '../../research/entities/project.entity';
import { Faq } from '../../faqs/entities/faq.entity';
import { AcademicCalendarEvent } from './calendar-event.entity';
import { SchoolResource } from './resource.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ default: '#003366' })
  color: string;

  @Column({ nullable: true })
  name_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  description_sw: string;

  @Column('text', { nullable: true })
  mission: string;

  @Column('text', { nullable: true })
  vision: string;

  @Column('text', { nullable: true })
  history: string;

  @Column('text', { nullable: true })
  governance: string;

  @Column('text', { nullable: true })
  core_values: string;

  // Media
  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_image_url: string;

  @Column('jsonb', { nullable: true })
  hero_images: string[];

  // Leadership
  @ManyToOne(() => StaffMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dean_id' })
  dean: StaffMember;

  @Column('text', { nullable: true })
  dean_message: string;

  @Column('text', { nullable: true })
  dean_bio: string;

  // Contact & Social
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website_url: string;

  @Column('jsonb', { nullable: true })
  testimonials: any;

  @Column('jsonb', { nullable: true })
  social_links: any;

  // Metadata
  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 'Published' })
  status: string;

  // SEO
  @Column({ nullable: true })
  meta_title: string;

  @Column({ nullable: true })
  meta_description: string;

  // Relations
  @OneToMany(() => Program, (program) => program.school)
  programmes: Program[];

  @OneToMany(() => Department, (department) => department.school)
  departments: Department[];

  @OneToMany(() => StaffMember, (staff) => staff.school)
  staff: StaffMember[];

  @OneToMany(() => ResearchProject, (project) => project.school)
  research_projects: ResearchProject[];

  @OneToMany(() => Faq, (faq) => faq.school)
  faqs: Faq[];

  @OneToMany(() => AcademicCalendarEvent, (event) => event.school)
  calendar_events: AcademicCalendarEvent[];

  @OneToMany(() => SchoolResource, (resource) => resource.school)
  resources: SchoolResource[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
