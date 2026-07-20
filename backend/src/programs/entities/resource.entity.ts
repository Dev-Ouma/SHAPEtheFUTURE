import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { School } from './school.entity';

@Entity('school_resources')
export class SchoolResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  type: string; // e.g., 'PDF', 'DOCX', 'External Link'

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  external_link: string;

  @Column({ nullable: true })
  file_size: string;

  @Column({ default: 'Learning Guides' })
  category: string;

  @ManyToOne(() => School, (school) => school.resources, {
    onDelete: 'CASCADE',
  })
  school: School;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
