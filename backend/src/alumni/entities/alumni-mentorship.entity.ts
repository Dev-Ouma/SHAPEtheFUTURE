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

@Entity('alumni_mentorship')
export class AlumniMentorship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AlumniProfile)
  @JoinColumn({ name: 'alumniId' })
  alumni: AlumniProfile;

  @Column()
  alumniId: string;

  @Column({ type: 'text' })
  expertise: string;

  @Column({ type: 'text', nullable: true })
  availability: string;

  @Column({ default: 'active' })
  status: string; // active, inactive

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
