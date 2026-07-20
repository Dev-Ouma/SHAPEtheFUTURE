import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('search_analytics')
export class SearchAnalytic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  query: string;

  @Column({ type: 'int', default: 0 })
  results_count: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  filter: string;

  @Column({ type: 'boolean', default: false })
  is_failed: boolean;

  @CreateDateColumn()
  searched_at: Date;
}
