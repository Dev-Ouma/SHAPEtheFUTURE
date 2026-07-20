import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ShapeSdlcStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'at_risk';

@Entity('shape_sdlc_stages')
export class ShapeSdlcStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  outputs: string;

  @Column({ type: 'text', nullable: true })
  evidence: string;

  @Column({ type: 'int', default: 0 })
  progress_percent: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', default: 'not_started' })
  status: ShapeSdlcStatus;

  @Column({ type: 'simple-json', nullable: true })
  document_urls: string[];

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
