import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Department } from '../../programs/entities/department.entity';
import { IctTicket } from './ict-ticket.entity';

export enum IctPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('ict_categories')
export class IctCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: IctPriority,
    default: IctPriority.MEDIUM,
  })
  default_priority: IctPriority;

  // Service-level target in hours used to compute a ticket's SLA due date.
  @Column({ type: 'int', default: 48 })
  sla_hours: number;

  @Column({ default: true })
  is_active: boolean;

  // Facilities/infrastructure categories (carried over from campus feedback) — used
  // to keep the "IT Technical Support" vs facilities routing distinction after merge.
  @Column({ default: false })
  is_infrastructure: boolean;

  // Restricts which feedback types (complaint/compliment/service_request) may use this
  // category on the public form; null means applicable to all.
  @Column('jsonb', { nullable: true })
  applicable_types: string[];

  @Column('jsonb', { nullable: true, default: [] })
  subcategories: string[];

  // Owning department, used to auto-route non-ICT complaints to the right unit.
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Optional default responder for new tickets in this category.
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'default_assignee_id' })
  default_assignee: User;

  @OneToMany(() => IctTicket, (ticket) => ticket.category)
  tickets: IctTicket[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
