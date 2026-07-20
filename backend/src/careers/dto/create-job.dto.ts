import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  title_sw?: string;

  @IsString()
  slug: string;

  @IsString()
  reference_code: string;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  summary_sw?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  description_sw?: string;

  @IsOptional()
  @IsString()
  division_id?: string;

  @IsOptional()
  @IsString()
  department_id?: string;

  @IsOptional()
  @IsString()
  job_category_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization_ids?: string[];

  @IsOptional()
  @IsString()
  employment_type?: string;

  @IsOptional()
  @IsString()
  experience_level?: string;

  @IsOptional()
  @IsString()
  job_grade?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  positions_available?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  is_remote?: boolean;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  responsibilities_sw?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  requirements_sw?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  qualifications_sw?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  benefits_sw?: string;

  @IsOptional()
  @IsString()
  additional_notes?: string;

  @IsOptional()
  @IsString()
  additional_notes_sw?: string;

  @IsOptional()
  @IsDateString()
  application_deadline?: string;

  @IsOptional()
  @IsString()
  application_method?: string;

  @IsOptional()
  @IsString()
  application_url?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
