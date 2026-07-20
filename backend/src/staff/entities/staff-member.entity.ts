import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Department } from '../../programs/entities/department.entity';
import { School } from '../../programs/entities/school.entity';
import { ExecutiveType } from './executive-type.entity';
import { StaffType } from './staff-type.entity';

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  job_title: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  honorific_title: string;

  @Column({ unique: true })
  profile_slug: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('text', { nullable: true })
  message: string;

  @Column('text', { nullable: true })
  academic_qualifications: string;

  @Column('text', { nullable: true })
  specializations: string;

  @Column('text', { nullable: true })
  publications: string;

  @Column({ type: 'boolean', default: true })
  is_current: boolean;

  @Column({ type: 'date', nullable: true })
  service_start_date: string;

  @Column({ type: 'date', nullable: true })
  service_end_date: string;

  // Visibility Controls
  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'boolean', default: false })
  is_public_contact: boolean;

  @Column({ type: 'boolean', default: false })
  show_publications: boolean;

  @Column({ type: 'boolean', default: false })
  show_message: boolean;

  @Column({ type: 'boolean', default: false })
  show_research_links: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToMany(() => ExecutiveType)
  @JoinTable({
    name: 'staff_executive_types',
    joinColumn: { name: 'staff_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'executive_type_id',
      referencedColumnName: 'id',
    },
  })
  executive_types: ExecutiveType[];

  @ManyToOne(() => StaffType, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'staff_type_id' })
  staff_type: StaffType;

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ nullable: true })
  github_url: string;

  @Column({ nullable: true })
  google_scholar_url: string;

  @Column({ nullable: true })
  researchgate_url: string;

  @Column({ nullable: true })
  orcid_id: string; // e.g. 0000-0002-1825-0097

  @Column({ nullable: true })
  twitter_url: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ default: 'Published' })
  status: string;

  // SEO Fields
  @Column({ nullable: true })
  meta_title: string;

  @Column('text', { nullable: true })
  meta_description: string;

  @Column({ nullable: true })
  og_image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
