import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PublishStatus } from '../../common/enums/publish-status.enum';
import { User } from '../../auth/entities/user.entity';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string; // HTML or JSON from the editor

  @Column({ type: 'text', nullable: true })
  content_sw: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  summary_sw: string;

  @Column({ nullable: true })
  banner_image: string;

  @Column({ nullable: true })
  parent_slug: string; // For sidebar grouping (e.g. 'about')

  @Column({ nullable: true })
  meta_title: string;

  @Column({ nullable: true })
  meta_title_sw: string;

  @Column({ nullable: true })
  meta_description: string;

  @Column({ type: 'text', nullable: true })
  meta_description_sw: string;

  @Column({ default: 'default' })
  layout_template: string; // 'default' | 'leadership'

  @Column({ nullable: true })
  leadership_name: string;

  @Column({ nullable: true })
  leadership_position: string;

  @Column({ type: 'json', nullable: true })
  layout_data: any;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status: PublishStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({ type: 'text', nullable: true })
  review_notes: string;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  syncPublishedState() {
    this.is_published = this.status === PublishStatus.PUBLISHED;
  }
}
