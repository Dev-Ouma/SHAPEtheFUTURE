import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { School } from '../../programs/entities/school.entity';

@Entity('research_grants')
export class Grant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  funder_name: string;

  @Column({ nullable: true })
  grant_reference_number: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  award_date: string;

  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @ManyToMany(() => StaffMember)
  @JoinTable({
    name: 'grant_investigators',
    joinColumn: { name: 'grant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'staff_id', referencedColumnName: 'id' },
  })
  investigators: StaffMember[];

  @ManyToOne(() => StaffMember, { nullable: true })
  @JoinColumn({ name: 'lead_investigator_id' })
  lead_investigator: StaffMember;

  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ default: 'ongoing' })
  status: string; // ongoing, completed, awarded

  @Column({ nullable: true })
  website_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
