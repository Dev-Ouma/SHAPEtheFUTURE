import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TenderCategory } from './tender-category.entity';
import { Department } from '../../../programs/entities/department.entity';
import { TenderDocument } from './tender-document.entity';

export enum TenderStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  CLOSED = 'Closed',
  AWARDED = 'Awarded',
}

@Entity('tenders')
export class Tender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  @Column({
    type: 'enum',
    enum: TenderStatus,
    default: TenderStatus.DRAFT,
  })
  status: TenderStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp' })
  closingAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  openingAt: Date;

  @Column('text', { nullable: true })
  scopeOfWork: string;

  @Column('text', { nullable: true })
  eligibilityCriteria: string;

  @Column('text', { nullable: true })
  submissionInstructions: string;

  @Column({ nullable: true })
  awardedTo: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  awardAmount: number;

  @Column({ type: 'date', nullable: true })
  awardDate: Date;

  @ManyToOne(() => TenderCategory, (category) => category.tenders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: TenderCategory;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  department: Department;

  @OneToMany(() => TenderDocument, (document) => document.tender, {
    cascade: true,
  })
  documents: TenderDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
