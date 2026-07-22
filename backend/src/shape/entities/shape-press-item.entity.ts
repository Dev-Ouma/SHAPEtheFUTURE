import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shape_press_items')
export class ShapePressItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  title_sw: string | null;

  @Column()
  source: string;

  @Column({ type: 'varchar', nullable: true })
  source_sw: string | null;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  date: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
