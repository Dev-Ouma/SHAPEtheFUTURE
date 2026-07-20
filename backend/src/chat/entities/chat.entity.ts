import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  ESCALATED = 'escalated',
}

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  session_id: string; // From guest localStorage or tracking

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  platform: string; // e.g. 'portal', 'public'

  @Column({ nullable: true })
  guest_name: string;

  @Column({ nullable: true })
  guest_email: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ConversationStatus.ACTIVE,
  })
  current_status: string;

  @OneToMany(() => ChatMessage, (message) => message.conversation)
  messages: ChatMessage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  last_active: Date;

  @Column({ nullable: true })
  assigned_agent_id: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ nullable: true })
  rated_at: Date;
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatConversation, (conversation) => conversation.messages)
  conversation: ChatConversation;

  @Column({ type: 'text' })
  content: string;

  @Column()
  sender: 'bot' | 'user' | 'admin';

  @Column({ type: 'json', nullable: true })
  links: any;

  @Column({ type: 'json', nullable: true })
  suggestions: any;

  @CreateDateColumn()
  timestamp: Date;
}
