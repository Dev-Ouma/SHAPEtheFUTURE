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
import { User } from '../../auth/entities/user.entity';
import { Department } from '../../programs/entities/department.entity';
import { IctCategory, IctPriority } from './ict-category.entity';
import { IctTicketResponse } from './ict-ticket-response.entity';

export enum IctTicketStatus {
  OPEN = 'Open',
  ACKNOWLEDGED = 'Acknowledged',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  CANCELLED = 'Cancelled',
}

export enum IctRequesterType {
  STAFF = 'Staff',
  STUDENT = 'Student',
  FACULTY = 'Faculty',
  OTHER = 'Other',
}

// Distinguishes the three intake kinds now handled by the ICT Service Desk after
// the Complaints & Compliments merge. Existing ICT records are Service Requests.
export enum IctFeedbackType {
  SERVICE_REQUEST = 'service_request',
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
}

// Sentiment carried over from the campus-feedback triage model.
export enum IctSentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  URGENT = 'Urgent',
}

/** Processing lane: campus infrastructure/helpdesk vs ICT technical support. */
export enum IctServiceGroup {
  HELPDESK = 'helpdesk',
  IT_TECHNICAL_SUPPORT = 'it_technical_support',
}

/** Intake channel for admin provenance (Website vs Mobile OUK APP vs Admin). */
export enum IctSubmissionSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN = 'admin',
  EMAIL = 'email',
  UNKNOWN = 'unknown',
}

@Entity('ict_tickets')
export class IctTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference_number: string;

  // The authenticated staff/student who raised the ticket (nullable for admin-logged tickets).
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // Denormalised requester identity for display and admin-logged tickets.
  @Column({ nullable: true })
  requester_name: string;

  @Column({ nullable: true })
  requester_email: string;

  @Column({
    type: 'enum',
    enum: IctRequesterType,
    default: IctRequesterType.STAFF,
  })
  requester_type: IctRequesterType;

  // Contact/identity details carried over from public complaint & compliment intake.
  @Column({ nullable: true })
  requester_phone: string;

  @Column({ nullable: true })
  identification_number: string;

  // True when the submitter chose to remain anonymous (complaints).
  @Column({ default: false })
  is_anonymous: boolean;

  // Whether the submitter consented to be contacted about their submission.
  @Column({ default: false })
  consent_given: boolean;

  // Whether this record is a service request (technical), a complaint, or a compliment.
  @Column({
    type: 'enum',
    enum: IctFeedbackType,
    default: IctFeedbackType.SERVICE_REQUEST,
  })
  feedback_type: IctFeedbackType;

  @Column({
    type: 'enum',
    enum: IctSentiment,
    nullable: true,
  })
  sentiment: IctSentiment;

  /** Derived from category at intake; persisted for lane-scoped queues and analytics. */
  @Column({
    type: 'enum',
    enum: IctServiceGroup,
    default: IctServiceGroup.IT_TECHNICAL_SUPPORT,
  })
  service_group: IctServiceGroup;

  /** Declared intake channel — ops visibility only; not used for authz. */
  @Column({
    type: 'enum',
    enum: IctSubmissionSource,
    default: IctSubmissionSource.UNKNOWN,
  })
  submission_source: IctSubmissionSource;

  /** Optional client hint (e.g. ios, android, web). */
  @Column({ nullable: true })
  client_platform: string;

  @ManyToOne(() => IctCategory, (category) => category.tickets, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: IctCategory;

  // Owning department for non-ICT complaints routed through the Service Desk.
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ nullable: true })
  subcategory: string;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  // Physical location of the issue (office, lab, campus, etc.).
  @Column({ nullable: true })
  location: string;

  // Date the incident occurred (from complaint intake), distinct from created_at.
  @Column({ type: 'date', nullable: true })
  incident_date: Date;

  // Free-text asset reference captured at intake (e.g. device/service the ticket concerns).
  @Column({ nullable: true })
  asset_tag: string;

  @Column('jsonb', { nullable: true, default: [] })
  attachment_urls: string[];

  @Column({
    type: 'enum',
    enum: IctTicketStatus,
    default: IctTicketStatus.OPEN,
  })
  status: IctTicketStatus;

  @Column({
    type: 'enum',
    enum: IctPriority,
    default: IctPriority.MEDIUM,
  })
  priority: IctPriority;

  @Column('jsonb', { nullable: true, default: [] })
  tags: string[];

  // Extracted keywords and AI triage confidence carried over from campus feedback.
  @Column('jsonb', { nullable: true, default: [] })
  keywords: string[];

  @Column({ type: 'float', nullable: true })
  ai_confidence_score: number;

  @Column({ default: false })
  is_escalated: boolean;

  @Column({ nullable: true })
  escalation_reason: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column('text', { nullable: true })
  resolution: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  sla_due_date: Date;

  @OneToMany(() => IctTicketResponse, (response) => response.ticket)
  responses: IctTicketResponse[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
