import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PublishStatus } from '../../common/enums/publish-status.enum';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  programme_code?: string;

  @IsString()
  @IsOptional()
  programme_image?: string;

  @IsString()
  @IsOptional()
  course_level?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsUUID()
  @IsOptional()
  schoolId?: string;

  @IsString()
  @IsOptional()
  application_status?: string;

  @IsArray()
  @IsOptional()
  mode_of_delivery?: string[];

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  cost?: string;

  @IsString()
  @IsOptional()
  atar?: string;

  @IsString()
  @IsOptional()
  enroll_link?: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsString()
  @IsOptional()
  overview_sw?: string;

  @IsString()
  @IsOptional()
  assessment?: string;

  @IsString()
  @IsOptional()
  rpl?: string;

  @IsString()
  @IsOptional()
  entry_requirements?: string;

  @IsString()
  @IsOptional()
  learning_outcomes?: string;

  @IsString()
  @IsOptional()
  careers?: string;

  @IsString()
  @IsOptional()
  credit_entry?: string;

  @IsString()
  @IsOptional()
  fees_scholarships?: string;

  @IsString()
  @IsOptional()
  programme_structure?: string;

  @IsString()
  @IsOptional()
  brochure_url?: string;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}
