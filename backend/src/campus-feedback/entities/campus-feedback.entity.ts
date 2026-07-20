import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CampusFeedbackCategory } from './campus-feedback-category.entity';
import { Department } from '../../programs/entities/department.entity';
import { User } from '../../auth/entities/user.entity';
import { CampusFeedbackResponse } from './campus-feedback-response.entity';
import {
  FeedbackPriority,
  FeedbackStatus,
} from '../../shared/feedback/feedback.enums';

export enum SubmitterType {
  EXTERNAL = 'External',
  STUDENT = 'Student',
  STAFF = 'Staff',
}

export enum FeedbackType {
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
}

export enum FeedbackSentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  URGENT = 'Urgent',
}

export enum FeedbackUrgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('campus_feedback')
export class CampusFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference_number: string;

  @Column({ type: 'enum', enum: FeedbackType, default: FeedbackType.COMPLAINT })
  feedback_type: FeedbackType;

  @Column({ type: 'enum', enum: SubmitterType, nullable: true })
  submitter_type: SubmitterType;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  identification_number: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitter_user_id' })
  submitter_user: User;

  @ManyToOne(() => CampusFeedbackCategory, (c) => c.feedback_items)
  @JoinColumn({ name: 'category_id' })
  category: CampusFeedbackCategory;

  @Column({ nullable: true })
  sub_category: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column({ type: 'date', nullable: true })
  incident_date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: FeedbackUrgency,
    default: FeedbackUrgency.MEDIUM,
  })
  urgency: FeedbackUrgency;

  @Column('jsonb', { nullable: true, default: [] })
  attachment_urls: string[];

  @Column({ nullable: true })
  preferred_contact_method: string;

  @Column({ default: false })
  consent_given: boolean;

  @Column({ default: false })
  is_anonymous: boolean;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.SUBMITTED,
  })
  status: FeedbackStatus;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    default: FeedbackPriority.LOW,
  })
  priority: FeedbackPriority;

  @Column({ type: 'enum', enum: FeedbackSentiment, nullable: true })
  sentiment: FeedbackSentiment;

  @Column('jsonb', { nullable: true, default: [] })
  tags: string[];

  @Column('jsonb', { nullable: true, default: [] })
  keywords: string[];

  @Column({ default: false })
  is_escalated: boolean;

  @Column({ nullable: true })
  escalation_reason: string;

  @Column({ type: 'float', nullable: true })
  ai_confidence_score: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column('text', { nullable: true })
  resolution: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  sla_due_date: Date;

  @OneToMany(() => CampusFeedbackResponse, (r) => r.feedback)
  responses: CampusFeedbackResponse[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
