import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('library_tutorials')
export class LibraryTutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  duration: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: 'Published' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
