import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../programs/entities/school.entity';

export enum PartnerType {
  INDUSTRY = 'Industry',
  JOINT_VENTURE = 'Joint Venture',
  ACADEMIC = 'Academic',
  GOVERNMENT = 'Government',
}

@Entity('research_partners')
export class ResearchPartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({
    type: 'enum',
    enum: PartnerType,
    default: PartnerType.INDUSTRY,
  })
  type: PartnerType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
