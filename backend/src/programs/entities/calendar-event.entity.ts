import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';

@Entity('academic_calendar_events')
export class AcademicCalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  @Column('date')
  date_start: string;

  @Column('date', { nullable: true })
  date_end: string;

  @Column({
    type: 'enum',
    enum: ['Academic', 'Holiday', 'Examination', 'Event'],
    default: 'Academic',
  })
  category: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
