import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum VideoStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
}

@Entity('service_charter_videos')
export class ServiceCharterVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true, default: '00:00' })
  duration: string;

  @Column({ nullable: true })
  transcript: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  display_order: number;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PUBLISHED })
  status: VideoStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
