import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import {
  ModeOfDelivery,
  ShortCourseLevel,
  ShortCourseStatus,
} from '../entities/short-course.entity';

export class CreateShortCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  about_sw?: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsString()
  @IsOptional()
  overview_sw?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  cost?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  number_of_modules?: number;

  @IsString()
  @IsOptional()
  modules_description?: string;

  @IsString()
  @IsOptional()
  modules_description_sw?: string;

  @IsString()
  @IsOptional()
  skills_gained?: string;

  @IsString()
  @IsOptional()
  skills_gained_sw?: string;

  @IsString()
  @IsOptional()
  target_audience?: string;

  @IsString()
  @IsOptional()
  target_audience_sw?: string;

  @IsEnum(ModeOfDelivery)
  @IsOptional()
  mode_of_delivery?: ModeOfDelivery;

  @IsEnum(ShortCourseLevel)
  @IsOptional()
  level?: ShortCourseLevel;

  @IsEnum(ShortCourseStatus)
  @IsOptional()
  status?: ShortCourseStatus;

  @IsOptional()
  school?: any;

  @IsOptional()
  department?: any;

  @IsOptional()
  course_category?: any;

  @IsOptional()
  learning_method?: any;

  @IsOptional()
  modules?: any[];
}

export class UpdateShortCourseDto extends CreateShortCourseDto {}
