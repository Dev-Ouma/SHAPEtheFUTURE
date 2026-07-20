import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('student_clubs')
export class StudentClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  category: string; // 'Sports', 'Academic', 'Arts', 'Leadership'

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  leader_name: string;

  @Column({ nullable: true })
  leader_id: string;

  @Column({ nullable: true })
  leader_email: string;

  @Column({ nullable: true })
  meeting_info: string;

  @Column({ nullable: true })
  join_link: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
