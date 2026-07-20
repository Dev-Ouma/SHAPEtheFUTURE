import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Complaint } from './complaint.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('complaint_responses')
export class ComplaintResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

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
