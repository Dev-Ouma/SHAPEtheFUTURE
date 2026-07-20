import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

export enum PartnershipType {
  ACADEMIC = 'Academic',
  GOVERNMENT = 'Government',
  INDUSTRY = 'Industry',
  RESEARCH = 'Research',
  COMMUNITY = 'Community',
  TECHNOLOGY = 'Technology',
}

@Entity('partner_categories')
export class PartnerCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Partner, (partner) => partner.category)
  partners: Partner[];
}

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column()
  website_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PartnershipType,
    default: PartnershipType.ACADEMIC,
  })
  partnership_type: PartnershipType;

  @ManyToOne(() => PartnerCategory, (category) => category.partners, {
    nullable: true,
  })
  category: PartnerCategory;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => PartnershipProject, (project) => project.partner)
  projects: PartnershipProject[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('partnership_projects')
export class PartnershipProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  project_link: string;

  @ManyToOne(() => Partner, (partner) => partner.projects)
  partner: Partner;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
@Entity('backlinks')
export class BackLink extends Partner {}
