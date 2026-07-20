import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IntelligenceType {
  FAQ = 'faq',
  KNOWLEDGE_CHUNK = 'knowledge_chunk',
  DOCUMENT_REF = 'document_ref',
  SMALLTALK = 'smalltalk',
}

@Entity('chat_intelligence')
export class ChatIntelligence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({
    type: 'enum',
    enum: IntelligenceType,
    default: IntelligenceType.FAQ,
  })
  type: IntelligenceType;

  @Column({ nullable: true })
  category: string; // e.g., 'admissions', 'fees', 'exam-policies'

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // e.g., { link: '...', department: '...' }

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
