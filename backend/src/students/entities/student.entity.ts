import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Program } from '../../programs/entities/program.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registration_number: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Program)
  current_program: Program;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date | null;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  national_id_passport: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ default: 1 })
  current_year: number;

  @Column({ default: 1 })
  current_semester: number;

  @CreateDateColumn()
  enrolled_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
