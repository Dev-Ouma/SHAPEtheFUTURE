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
} from 'typeorm';
import { School } from '../../programs/entities/school.entity';
import { Department } from '../../programs/entities/department.entity';
import { ShortCourseCategory, LearningMethod } from './taxonomies.entity';
import { ShortCourseModule } from './short-course-module.entity';

export enum ModeOfDelivery {
  ONLINE = 'Online',
  BLENDED = 'Blended',
  IN_PERSON = 'In-Person',
  HYBRID = 'Hybrid',
}

export enum ShortCourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum ShortCourseStatus {
  DRAFT = 'Draft',
  REVIEW = 'Review',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

@Entity('short_courses')
export class ShortCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Index()
  @Column({ unique: true })
  code: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  about: string;

  @Column('text', { nullable: true })
  about_sw: string;

  @Column('text', { nullable: true })
  overview: string;

  @Column('text', { nullable: true })
  overview_sw: string;

  @Column({ nullable: true })
  category_label: string;

  @ManyToOne(() => ShortCourseCategory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'courseCategoryId' })
  course_category: ShortCourseCategory;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  cost: string;

  @Column({ nullable: true })
  image_url: string;

  @ManyToOne(() => LearningMethod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'learningMethodId' })
  learning_method: LearningMethod;

  @Column({
    type: 'enum',
    enum: ModeOfDelivery,
    default: ModeOfDelivery.ONLINE,
  })
  mode_of_delivery: ModeOfDelivery;

  @Column({
    type: 'enum',
    enum: ShortCourseLevel,
    default: ShortCourseLevel.BEGINNER,
  })
  level: ShortCourseLevel;

  @Column({ type: 'int', default: 0 })
  number_of_modules: number;

  @Column('text', { nullable: true })
  modules_description: string;

  @Column('text', { nullable: true })
  modules_description_sw: string;

  @Column('text', { nullable: true })
  skills_gained: string;

  @Column('text', { nullable: true })
  skills_gained_sw: string;

  @Column('text', { nullable: true })
  target_audience: string;

  @Column('text', { nullable: true })
  target_audience_sw: string;

  @Column({
    type: 'enum',
    enum: ShortCourseStatus,
    default: ShortCourseStatus.DRAFT,
  })
  status: ShortCourseStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => ShortCourseModule, (module) => module.short_course, {
    cascade: true,
  })
  modules: ShortCourseModule[];
}
