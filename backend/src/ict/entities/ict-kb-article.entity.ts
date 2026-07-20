import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

// A self-service IT knowledge base article (how-to / troubleshooting guide).
@Entity('ict_kb_articles')
export class IctKbArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  // Short plain-text summary shown in lists and search results.
  @Column({ type: 'text', nullable: true })
  summary: string;

  // Rich HTML body produced by the Tiptap editor.
  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ nullable: true })
  category: string;

  @Column('jsonb', { nullable: true, default: [] })
  tags: string[];

  @Column({ default: false })
  is_published: boolean;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  helpful_yes: number;

  @Column({ type: 'int', default: 0 })
  helpful_no: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
