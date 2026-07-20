import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('student_events')
export class StudentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column('text')
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  type: string; // 'Orientation', 'Workshop', 'Webinar', 'Activity'

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  rsvp_link: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
