import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('student_support_services')
export class StudentSupportService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category: string; // 'Counseling', 'ICT', 'Financial Aid', 'Accessibility'

  @Column({ nullable: true })
  contact_info: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  apply_link: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
