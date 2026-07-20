import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('programme_fees')
export class ProgrammeFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Program, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ManyToOne(() => AcademicYear, (year) => year.programme_fees, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'academic_year_id' })
  academic_year: AcademicYear;

  // Breakdown array for Semester calculations.
  // e.g. [{"year": 1, "semester": 1, "fee_type": "Tuition", "amount": 43000}]
  @Column('jsonb', { default: [] })
  semester_breakdown: any[];

  @Column({ default: 'KES' })
  currency: string;

  @Column({ default: true })
  is_active: boolean;

  // Totals Cache
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tuition_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  registration_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  student_activity_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  examination_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  technology_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  library_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  practical_laboratory_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  attachment_internship_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  graduation_fee: number;

  // Dynamic custom fees
  @Column('jsonb', { default: [] })
  other_fees: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
