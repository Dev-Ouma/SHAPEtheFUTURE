import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { School } from '../../programs/entities/school.entity';
import { PublishStatus } from '../../common/enums/publish-status.enum';
import { User } from '../../auth/entities/user.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @Column({ type: 'text', nullable: true })
  content_sw: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  summary_sw: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: 'News' })
  type: string; // 'News' or 'Research' or 'Event'

  @Column({ default: 'Announcement' })
  category: string;

  @Column({ nullable: true })
  featured_image_caption: string;

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

  @Column({ nullable: true })
  featuredMenuId: string | null;

  @ManyToOne(() => Menu, { nullable: true })
  @JoinColumn({ name: 'featuredMenuId' })
  featured_menu: Menu;

  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  school: School;

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
