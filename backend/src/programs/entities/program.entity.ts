import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { School } from './school.entity';
import { Department } from './department.entity';
import { CourseUnit } from './course-unit.entity';
import { PublishStatus } from '../../common/enums/publish-status.enum';
import { User } from '../../auth/entities/user.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Index()
  @Column({ nullable: true })
  programme_code: string;

  @Column('text', { nullable: true })
  programme_image: string;

  @Column({ nullable: true })
  level: string; // From Taxonomy

  @ManyToOne(() => Department, (dept) => dept.programs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => School, (school) => school.programmes, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  application_status: string;

  @Column('simple-array', { nullable: true })
  mode_of_delivery: string[];

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  cost: string;

  @Column({ nullable: true })
  atar: string;

  @Column('text', { nullable: true })
  enroll_link: string;

  @Column('text', { nullable: true })
  overview: string;

  @Column('text', { nullable: true })
  overview_sw: string;

  @Column('text', { nullable: true })
  assessment: string;

  @Column('text', { nullable: true })
  rpl: string;

  @Column('text', { nullable: true })
  entry_requirements: string;

  @Column('text', { nullable: true })
  learning_outcomes: string;

  @Column('text', { nullable: true })
  careers: string;

  @Column('text', { nullable: true })
  credit_entry: string;

  @Column('text', { nullable: true })
  fees_scholarships: string;

  @Column('text', { nullable: true })
  programme_structure: string;

  @Column({ nullable: true })
  brochure_url: string;

  // Not eager: list/search paths must not pull every unit. Detail uses explicit joins.
  @OneToMany(() => CourseUnit, (unit) => unit.program, {
    cascade: true,
  })
  units: CourseUnit[];

  @Column({ default: false })
  is_featured: boolean; // For highlighting in search and home

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status: PublishStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({ type: 'text', nullable: true })
  review_notes: string;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  syncPublishedState() {
    this.is_published = this.status === PublishStatus.PUBLISHED;
  }
}
