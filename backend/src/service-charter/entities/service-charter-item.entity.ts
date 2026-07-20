import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('service_charter_items')
export class ServiceCharterItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  service: string;

  @Column()
  timeline: string;

  @Column()
  unit: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text', { array: true, default: '{}' })
  docs: string[];

  @Column('text', { array: true, default: '{}' })
  steps: string[];

  @Column('text', { array: true, default: '{}' })
  faqs: string[];

  @Column({ default: 0 })
  display_order: number;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
