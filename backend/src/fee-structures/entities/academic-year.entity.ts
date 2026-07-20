import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProgrammeFee } from './programme-fee.entity';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  year_range: string; // e.g., '2025/2026'

  @Column({ default: false })
  is_current: boolean; // Only one should be current

  @Column({ default: true })
  is_published: boolean;

  @OneToMany(() => ProgrammeFee, (pf) => pf.academic_year)
  programme_fees: ProgrammeFee[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
