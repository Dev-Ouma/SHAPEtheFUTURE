import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  subtitle_sw: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true })
  tagline_sw: string;

  @Column()
  image_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ default: 'upload' })
  video_type: string; // 'upload' or 'youtube'

  @Column({ nullable: true })
  cta_text: string;

  @Column({ nullable: true })
  cta_text_sw: string;

  @Column({ nullable: true })
  cta_link: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
