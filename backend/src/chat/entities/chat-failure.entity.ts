import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ChatConversation } from './chat.entity';

@Entity('chat_failures')
export class ChatFailure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'text', nullable: true })
  bot_response: string;

  @Column({ type: 'float', default: 0 })
  confidence: number;

  @ManyToOne(() => ChatConversation, { nullable: true })
  conversation: ChatConversation;

  @Column({ nullable: true })
  session_id: string;

  @Column({ default: false })
  is_resolved: boolean;

  @Column({ type: 'text', nullable: true })
  resolution_note: string;

  @CreateDateColumn()
  created_at: Date;
}
