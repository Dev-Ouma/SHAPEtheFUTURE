import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DatabaseCategory {
  MULTIDISCIPLINARY = 'multidisciplinary',
  STEM = 'stem',
  BUSINESS = 'business',
  LAW = 'law',
  HEALTH = 'health',
  ARTS = 'arts',
}

@Entity('library_databases')
export class LibraryDatabase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  provider: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: DatabaseCategory,
    default: DatabaseCategory.MULTIDISCIPLINARY,
  })
  category: DatabaseCategory;

  @Column({ default: true })
  is_premium: boolean;

  @Column()
  access_url: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ default: 'Published' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
