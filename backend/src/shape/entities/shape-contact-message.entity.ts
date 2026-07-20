import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type ShapeContactStatus = 'new' | 'read' | 'replied';

@Entity('shape_contact_messages')
export class ShapeContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  organization: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: 'new' })
  status: ShapeContactStatus;

  @CreateDateColumn()
  created_at: Date;
}
