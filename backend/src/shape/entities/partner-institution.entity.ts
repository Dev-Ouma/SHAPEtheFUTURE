import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PartnerRegion = 'east_africa' | 'europe';

@Entity('shape_partners')
export class PartnerInstitution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  name_sw: string | null;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  short_name: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  website_url: string;

  /** Consortium role label, e.g. Project Coordinator / EU Partner */
  @Column({ nullable: true })
  consortium_role: string;

  /** Institutional about text (distinct from SHAPE responsibilities). */
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_sw: string | null;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  contact_role: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  responsibilities_sw: string | null;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', default: 'east_africa' })
  region: PartnerRegion;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
