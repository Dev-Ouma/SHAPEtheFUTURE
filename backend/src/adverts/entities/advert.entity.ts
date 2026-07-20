import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('adverts')
export class Advert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_sw: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  content_sw: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'varchar', default: 'image' })
  media_type: 'image' | 'video' | 'youtube';

  @Column({ nullable: true })
  button_text: string;

  @Column({ nullable: true })
  button_text_sw: string;

  @Column({ nullable: true })
  button_link: string;

  @Column({ default: true })
  open_in_new_tab: boolean;

  @Column({ default: '#1e234a' })
  theme_color: string;

  @Column({ nullable: true })
  button_color: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
