import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PartnerInstitution } from './partner-institution.entity';
import { WorkPackage } from './work-package.entity';

export type ShapeDocumentCategory =
  | 'deliverables'
  | 'reports'
  | 'minutes'
  | 'financial'
  | 'presentations'
  | 'policy_briefs'
  | 'publications'
  | 'templates'
  | 'other';

@Entity('shape_documents')
export class ShapeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  title_sw: string | null;

  @Column({ type: 'text', nullable: true })
  description_sw: string | null;

  @Column({ type: 'varchar', default: 'other' })
  category: ShapeDocumentCategory;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_type: string;

  @Column({ type: 'int', nullable: true })
  file_size: number | null;

  /** WebVTT / caption track URL for video or audio assets. */
  @Column({ nullable: true })
  captions_url: string;

  /** Full text transcript for media or document accessibility. */
  @Column({ type: 'text', nullable: true })
  transcript: string;

  /** Optional sign-language interpretation video/page URL. */
  @Column({ nullable: true })
  sign_language_url: string;

  @Column({ nullable: true })
  work_package_id: string | null;

  @ManyToOne(() => WorkPackage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'work_package_id' })
  work_package: WorkPackage;

  @Column({ nullable: true })
  partner_id: string | null;

  @ManyToOne(() => PartnerInstitution, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner: PartnerInstitution;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ default: true })
  is_public: boolean;

  @Column({ default: false })
  is_published: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
