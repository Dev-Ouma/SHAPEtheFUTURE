import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { FeedbackType } from '../entities/campus-feedback.entity';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

export class SubmitCampusFeedbackDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  identification_number?: string;

  @IsOptional()
  @IsString()
  submitter_type?: string;

  @IsEnum(FeedbackType)
  feedback_type: FeedbackType;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsString()
  sub_category?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  department_id?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  incident_date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachment_urls?: string[];

  @IsOptional()
  @IsString()
  preferred_contact_method?: string;

  @IsBoolean()
  consent_given: boolean;

  @IsBoolean()
  is_anonymous: boolean;

  @IsOptional()
  @IsString()
  submission_source?: string;

  @IsOptional()
  @IsString()
  client_platform?: string;
}

export class TrackCampusFeedbackDto {
  @IsString()
  @IsNotEmpty()
  reference_number: string;

  @IsEmail()
  email: string;
}

export class UpdateCampusFeedbackStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class AssignCampusFeedbackDto {
  @IsUUID()
  @IsNotEmpty()
  staff_id: string;
}

export class AddCampusFeedbackResponseDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;
}

export class CampusFeedbackListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  feedback_type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  infrastructure_only?: string;
}
