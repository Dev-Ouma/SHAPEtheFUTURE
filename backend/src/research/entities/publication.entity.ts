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

export enum PublicationType {
  JOURNAL = 'journal',
  CONFERENCE_PAPER = 'conference_paper',
  BOOK = 'book',
  BOOK_CHAPTER = 'book_chapter',
  THESIS = 'thesis',
  TECHNICAL_REPORT = 'technical_report',
  PATENT = 'patent',
}

export enum AccessLevel {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
}

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  abstract: string;

  @Column({ type: 'text', nullable: true })
  abstract_sw: string;

  @Column({ type: 'int', nullable: true })
  publication_year: number;

  @ManyToMany(() => StaffMember)
  @JoinTable({
    name: 'publication_authors',
    joinColumn: { name: 'publication_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'staff_id', referencedColumnName: 'id' },
  })
  staff_authors: StaffMember[];

  @Column({ type: 'text', nullable: true })
  external_authors: string;

  @Column({
    type: 'enum',
    enum: PublicationType,
    default: PublicationType.JOURNAL,
  })
  type: PublicationType;

  // Classification
  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column('simple-array', { nullable: true })
  keywords: string[];

  // Academic Metadata
  @Column({ nullable: true })
  journal_name: string;

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  volume: string;

  @Column({ nullable: true })
  issue: string;

  @Column({ nullable: true })
  pages: string;

  @Column({ nullable: true })
  issn_isbn: string;

  @Column({ nullable: true })
  doi: string;

  @Column({ nullable: true })
  url: string;

  // Media & Files
  @Column({ nullable: true })
  pdf_file_url: string;

  @Column({ type: 'jsonb', nullable: true })
  supplementary_files: any;

  // Access & Metrics
  @Column({ default: false })
  is_open_access: boolean;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.PUBLIC,
  })
  access_level: AccessLevel;

  @Column({ type: 'int', default: 0 })
  citation_count: number;

  @Column({ type: 'int', default: 0 })
  download_count: number;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ default: 'Published' })
  status: string; // Draft / Published

  @ManyToOne(() => ResearchProgramme, (programme) => programme.publications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'programme_id' })
  programme: ResearchProgramme;

  // SEO
  @Column({ nullable: true })
  meta_title: string;

  @Column({ nullable: true })
  meta_title_sw: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'text', nullable: true })
  meta_description_sw: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
