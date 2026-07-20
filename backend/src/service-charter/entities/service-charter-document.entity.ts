import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum DocumentStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('service_charter_documents')
export class ServiceCharterDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_type: string; // PDF, DOCX, XLSX, PPTX

  @Column({ nullable: true })
  file_size: string;

  @Column()
  category: string;

  @Column({ nullable: true, default: 'v1.0' })
  version: string;

  @Column({ default: 0 })
  download_count: number;

  @Column({ default: 0 })
  display_order: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PUBLISHED,
  })
  status: DocumentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
