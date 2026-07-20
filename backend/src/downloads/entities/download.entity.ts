import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { DownloadCategory } from './download-category.entity';
import { DownloadTag } from './download-tag.entity';
import { User } from '../../auth/entities/user.entity';

export enum DownloadStatus {
  DRAFT = 'Draft',
  REVIEW = 'Review',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export enum AccessLevel {
  PUBLIC = 'Public',
  REGISTERED = 'Registered',
  STAFF = 'Staff',
  RESTRICTED = 'Restricted',
}

@Entity('downloads')
export class Download {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Basic Information ---
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => DownloadCategory, (category) => category.downloads, {
    onDelete: 'CASCADE',
  })
  category: DownloadCategory;

  @ManyToMany(() => DownloadTag)
  @JoinTable({ name: 'downloads_tags_relation' })
  tags: DownloadTag[];

  @Column()
  document_type: string; // PDF, DOCX, XLSX

  // --- File Management ---
  @Column({ nullable: true })
  file_url: string; // Reference to internal storage

  @Column({ nullable: true })
  external_url: string; // Reference to external storage

  @Column({ nullable: true })
  file_name: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ nullable: true })
  file_extension: string;

  @Column({ nullable: true, default: 'v1.0' })
  version: string;

  @Column({ nullable: true, default: 'English' })
  language: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  // --- Access Control ---
  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.PUBLIC })
  access_level: AccessLevel;

  @Column({ default: false })
  requires_authentication: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date;

  @Column({ default: false })
  watermark_enabled: boolean;

  @Column({ default: false })
  requires_terms_acceptance: boolean;

  // --- Publishing & Workflow ---
  @Column({ type: 'enum', enum: DownloadStatus, default: DownloadStatus.DRAFT })
  status: DownloadStatus;

  @Column({ type: 'timestamp', nullable: true })
  publish_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  unpublish_at: Date;

  @ManyToOne(() => User, { nullable: true })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  updated_by: User;

  @ManyToOne(() => User, { nullable: true })
  approved_by: User;

  // --- Analytics & Reporting ---
  @Column({ default: 0 })
  download_count: number;

  @Column({ default: 0 })
  unique_downloads: number;

  @Column({ type: 'timestamp', nullable: true })
  last_downloaded_at: Date;

  @Column({ type: 'float', default: 0 })
  popularity_score: number;

  // --- SEO & Metadata ---
  @Column({ nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'simple-array', nullable: true })
  meta_keywords: string[];

  @Column({ nullable: true })
  canonical_url: string;

  // --- Display & UI Control ---
  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  show_on_homepage: boolean;

  @Column({ default: true })
  allow_preview: boolean;

  @Column({ default: true })
  show_file_size: boolean;

  @Column({ default: true })
  show_version: boolean;

  // --- Standard Timestamps ---
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
