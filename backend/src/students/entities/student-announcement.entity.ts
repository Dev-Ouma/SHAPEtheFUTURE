import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('student_announcements')
export class StudentAnnouncement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 'General' })
  category: string; // e.g., 'Registration', 'Exams', 'Orientation', 'Maintenance'

  @Column({ default: 'Medium' })
  priority: string; // 'Low', 'Medium', 'High', 'Urgent'

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  media_url: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
