import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EResourceProvider } from './provider.entity';
import { EResourceSubject } from './subject.entity';

export enum EResourceType {
  EBOOK = 'E-Book',
  EJOURNAL = 'E-Journal',
  DATABASE = 'Database',
  REPOSITORY = 'Institutional Repository',
  OPEN_ACCESS = 'Open Access Resource',
  PAST_PAPER = 'Past Paper',
}

export enum EResourceAccessType {
  OPEN = 'Open Access',
  RESTRICTED = 'Restricted',
}

@Entity('e_resources')
export class EResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('text')
  summary: string;

  @Column({
    type: 'enum',
    enum: EResourceType,
    default: EResourceType.EBOOK,
  })
  resource_type: EResourceType;

  @ManyToOne(() => EResourceProvider, (provider) => provider.resources, {
    nullable: true,
  })
  provider?: EResourceProvider | null;

  @ManyToMany(() => EResourceSubject, (subject) => subject.resources)
  @JoinTable({ name: 'e_resources_subjects_mapping' })
  subjects: EResourceSubject[];

  @Column({
    type: 'enum',
    enum: EResourceAccessType,
    default: EResourceAccessType.OPEN,
  })
  access_type: EResourceAccessType;

  @Column({ default: false })
  requires_login: boolean;

  @Column('text', { nullable: true })
  access_instructions: string;

  @Column({ nullable: true })
  external_url: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  click_count: number;

  @Column({ nullable: true })
  meta_title: string;

  @Column('text', { nullable: true })
  meta_description: string;

  @Column({ default: 'Published' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
