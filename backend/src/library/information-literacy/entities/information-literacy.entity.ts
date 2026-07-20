import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('information_literacy_config')
export class InformationLiteracyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // A. Core Fields
  @Column({ default: 'Information Literacy' })
  title: string;

  @Column({ default: 'information-literacy' })
  slug: string;

  @Column({ type: 'text', nullable: true })
  intro_content: string;

  // B. Sections (Modular)
  @Column({ type: 'jsonb', nullable: true })
  core_competencies: any;

  @Column({ type: 'jsonb', nullable: true })
  research_steps: any;

  @Column({ type: 'jsonb', nullable: true })
  evaluation_framework: any;

  @Column({ type: 'text', nullable: true })
  plagiarism_content: string;

  @Column({ type: 'jsonb', nullable: true })
  citation_styles: any;

  @Column({ type: 'jsonb', nullable: true })
  resources: any;

  @Column({ type: 'text', nullable: true })
  training_content: string;

  // C. CTAs
  @Column({ nullable: true, default: 'Start Learning' })
  primary_cta_label: string;

  @Column({ nullable: true, default: '#core-competencies' })
  primary_cta_link: string;

  @Column({ nullable: true, default: 'Access Library Resources' })
  secondary_cta_label: string;

  @Column({ nullable: true, default: '/library/resources' })
  secondary_cta_link: string;

  // D. Media
  @Column({ nullable: true })
  hero_image_id: string;

  @Column({ type: 'jsonb', nullable: true })
  icons: any;

  // E. SEO
  @Column({ nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  // F. Status
  @Column({ default: 'Published' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
