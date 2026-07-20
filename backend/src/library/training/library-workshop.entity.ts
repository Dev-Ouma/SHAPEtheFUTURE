import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WorkshopType {
  WEBINAR = 'Webinar',
  IN_PERSON = 'In-Person',
  HYBRID = 'Hybrid',
}

@Entity('library_workshops')
export class LibraryWorkshop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: WorkshopType,
    default: WorkshopType.WEBINAR,
  })
  type: WorkshopType;

  @Column()
  speaker: string;

  @Column({ default: 0 })
  total_slots: number;

  @Column({ default: 0 })
  available_slots: number;

  @Column('text')
  description: string;

  @Column({ default: 'Published' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
