import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateComplaintDto {
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
  complaint_type?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
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
}

export class UpdateComplaintStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class AssignComplaintDto {
  @IsUUID()
  @IsNotEmpty()
  staff_id: string;
}

export class AddResponseDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;
}
