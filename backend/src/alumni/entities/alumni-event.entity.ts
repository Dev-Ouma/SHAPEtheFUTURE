import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alumni_events')
export class AlumniEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  rsvp_link: string;

  @Column({ default: 'upcoming' })
  status: string; // upcoming, past

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, type: 'int' })
  capacity: number;

  @Column({ nullable: true })
  rsvp_deadline: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
