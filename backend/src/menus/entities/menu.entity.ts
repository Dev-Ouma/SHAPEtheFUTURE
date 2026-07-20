import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { News } from '../../news/entities/news.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_public: boolean;

  @Column({ default: 'header' })
  position: string; // 'header' or 'footer' or 'top_header'

  @Column({ default: '_self' })
  target: string; // '_self' or '_blank'

  @Column({ nullable: true })
  parentId: string | null;

  @ManyToOne(() => Menu, (menu) => menu.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @OneToMany(() => News, (news) => news.featured_menu)
  featuredNews: News[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
