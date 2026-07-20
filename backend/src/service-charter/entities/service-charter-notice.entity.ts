import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NoticeType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  DANGER = 'danger',
}

@Entity('service_charter_notices')
export class ServiceCharterNotice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: NoticeType, default: NoticeType.INFO })
  type: NoticeType;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  expires_at: Date;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
