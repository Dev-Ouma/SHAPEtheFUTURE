import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alumni_profiles')
export class AlumniProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  graduationYear: number;

  @Column()
  programme: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  employer: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  linkedIn: string;

  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  isFeatured: boolean;
  @Column({ default: 'pending' })
  verificationStatus: string;

  @Column({ nullable: true })
  studentNumber: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
