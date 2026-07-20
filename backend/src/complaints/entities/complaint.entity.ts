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
import { ComplaintCategory } from './complaint-category.entity';
import { Department } from '../../programs/entities/department.entity';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { User } from '../../auth/entities/user.entity';
import { ComplaintResponse } from './complaint-response.entity';

export enum ComplaintType {
  EXTERNAL = 'External',
  STUDENT = 'Student',
  STAFF = 'Staff',
}

export enum ComplaintSentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  URGENT = 'Urgent',
}

export enum ComplaintStatus {
  SUBMITTED = 'Submitted',
  ACKNOWLEDGED = 'Acknowledged',
  UNDER_REVIEW = 'Under Review',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  REJECTED = 'Rejected',
  ESCALATED = 'Escalated',
}

export enum ComplaintPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference_number: string;

  @Column({
    type: 'enum',
    enum: ComplaintType,
    nullable: true,
  })
  complaint_type: ComplaintType;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  identification_number: string;

  @ManyToOne(() => ComplaintCategory, (category) => category.complaints)
  @JoinColumn({ name: 'category_id' })
  category: ComplaintCategory;

  @Column({ nullable: true })
  subcategory: string;

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
    enum: ComplaintStatus,
    default: ComplaintStatus.SUBMITTED,
  })
  status: ComplaintStatus;

  @Column({
    type: 'enum',
    enum: ComplaintPriority,
    default: ComplaintPriority.LOW,
  })
  priority: ComplaintPriority;

  @Column({
    type: 'enum',
    enum: ComplaintSentiment,
    nullable: true,
  })
  sentiment: ComplaintSentiment;

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

  @OneToMany(() => ComplaintResponse, (response) => response.complaint)
  responses: ComplaintResponse[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
