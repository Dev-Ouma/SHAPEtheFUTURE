import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CampusFeedback } from './campus-feedback.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('campus_feedback_responses')
export class CampusFeedbackResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CampusFeedback, (f) => f.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedback_id' })
  feedback: CampusFeedback;

  @Column('text')
  message: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responded_by_id' })
  responded_by: User;

  @Column({ default: false })
  is_internal: boolean;

  @CreateDateColumn()
  created_at: Date;
}
