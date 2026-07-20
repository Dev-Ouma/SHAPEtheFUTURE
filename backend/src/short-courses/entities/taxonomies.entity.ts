import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('short_course_categories')
export class ShortCourseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // English

  @Column({ nullable: true })
  name_sw: string; // Swahili

  @Column({ unique: true })
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('learning_methods')
export class LearningMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Online", "Self-paced"

  @Column({ nullable: true })
  name_sw: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
