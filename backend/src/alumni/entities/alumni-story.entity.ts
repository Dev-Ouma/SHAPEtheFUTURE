import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AlumniProfile } from './alumni-profile.entity';

@Entity('alumni_stories')
export class AlumniStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => AlumniProfile)
  @JoinColumn({ name: 'alumniId' })
  alumni: AlumniProfile;

  @Column()
  alumniId: string;

  @Column()
  category: string; // career_success, impact, research, etc.

  @Column({ nullable: true })
  image_url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
