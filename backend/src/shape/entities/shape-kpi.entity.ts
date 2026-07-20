import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ShapeKpiCategory =
  | 'overview'
  | 'engagement'
  | 'outputs'
  | 'budget';

@Entity('shape_kpis')
export class ShapeKpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;

  @Column()
  value: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'varchar', nullable: true })
  target: string | null;

  @Column({ type: 'varchar', default: 'overview' })
  category: ShapeKpiCategory;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
