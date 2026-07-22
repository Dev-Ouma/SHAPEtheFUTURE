import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ShapeRiskLevel = 'low' | 'medium' | 'high';
export type ShapeRiskStatus = 'open' | 'mitigating' | 'closed';

@Entity('shape_risks')
export class ShapeRisk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'medium' })
  likelihood: ShapeRiskLevel;

  @Column({ type: 'varchar', default: 'medium' })
  impact: ShapeRiskLevel;

  @Column({ type: 'varchar', default: 'open' })
  status: ShapeRiskStatus;

  @Column({ type: 'text', nullable: true })
  mitigation: string;

  @Column({ nullable: true })
  owner: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: false })
  is_published: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
