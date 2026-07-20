import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ShortCourse } from './short-course.entity';

@Entity('short_course_modules')
export class ShortCourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('int')
  order: number;

  @ManyToOne(() => ShortCourse, (course) => course.modules, {
    onDelete: 'CASCADE',
  })
  short_course: ShortCourse;
}
