import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Download } from './download.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('download_logs')
export class DownloadLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Download, { onDelete: 'CASCADE' })
  download: Download;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  downloaded_at: Date;
}
