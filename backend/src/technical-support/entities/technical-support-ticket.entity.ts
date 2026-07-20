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
import { TechnicalSupportNote } from './technical-support-note.entity';
import {
  FeedbackPriority,
  FeedbackStatus,
} from '../../shared/feedback/feedback.enums';

export enum TicketSubmitterRole {
  STUDENT = 'student',
  STAFF = 'staff',
}

@Entity('technical_support_tickets')
export class TechnicalSupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference_number: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitter_id' })
  submitter: User;

  @Column()
  submitter_name: string;

  @Column()
  submitter_email: string;

  @Column({ type: 'enum', enum: TicketSubmitterRole })
  submitter_role: TicketSubmitterRole;

  @Column({ nullable: true })
  submitter_department: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  related_system: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    default: FeedbackPriority.MEDIUM,
  })
  priority: FeedbackPriority;

  @Column('jsonb', { nullable: true, default: [] })
  attachment_urls: string[];

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.SUBMITTED,
  })
  status: FeedbackStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column('text', { nullable: true })
  resolution_note: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @OneToMany(() => TechnicalSupportNote, (n) => n.ticket)
  notes: TechnicalSupportNote[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
