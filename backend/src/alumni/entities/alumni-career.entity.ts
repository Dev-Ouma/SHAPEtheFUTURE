import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alumni_careers')
export class AlumniCareer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  type: string; // Job, Internship, Scholarship, Partnership

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  deadline: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 'public' })
  visibility: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
