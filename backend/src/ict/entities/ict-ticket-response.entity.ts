import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IctTicket } from './ict-ticket.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('ict_ticket_responses')
export class IctTicketResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IctTicket, (ticket) => ticket.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: IctTicket;

  @Column('text')
  message: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responded_by_id' })
  responded_by: User;

  // Internal notes are hidden from the requester's view of the ticket.
  @Column({ default: false })
  is_internal: boolean;

  @CreateDateColumn()
  created_at: Date;
}
