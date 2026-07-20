import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TechnicalSupportTicket } from './technical-support-ticket.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('technical_support_notes')
export class TechnicalSupportNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TechnicalSupportTicket, (t) => t.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: TechnicalSupportTicket;

  @Column('text')
  body: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  author_name: string;

  @CreateDateColumn()
  created_at: Date;
}
