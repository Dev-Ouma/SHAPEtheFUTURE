import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_sidebar_categories')
export class AdminSidebarCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => AdminSidebarItem, (item) => item.category, { cascade: true })
  items: AdminSidebarItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('admin_sidebar_items')
export class AdminSidebarItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column()
  href: string;

  @Column()
  icon: string; // Store as string name like 'LayoutDashboard', 'Users', etc.

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'categoryId' })
  categoryId: string;

  @ManyToOne(() => AdminSidebarCategory, (category) => category.items, {
    onDelete: 'CASCADE',
  })
  category: AdminSidebarCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
