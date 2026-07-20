import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { FeedbackPriority } from '../../shared/feedback/feedback.enums';
import { TicketSubmitterRole } from '../entities/technical-support-ticket.entity';

const normalizePriority = ({ value }: { value: unknown }) => {
  if (value == null || value === '') return undefined;
  const raw = String(value).trim().toLowerCase();
  if (raw === 'low') return FeedbackPriority.LOW;
  if (raw === 'medium') return FeedbackPriority.MEDIUM;
  if (raw === 'high') return FeedbackPriority.HIGH;
  if (raw === 'critical' || raw === 'urgent') return FeedbackPriority.CRITICAL;
  return value;
};

export class SubmitTechnicalSupportDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  submitter_type?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  related_system?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @Transform(normalizePriority)
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachment_urls?: string[];

  @IsOptional()
  @IsString()
  submission_source?: string;

  @IsOptional()
  @IsString()
  client_platform?: string;
}

export class CreateTechnicalSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  related_system?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachment_urls?: string[];

  @IsOptional()
  @IsString()
  submission_source?: string;

  @IsOptional()
  @IsString()
  client_platform?: string;
}

export class UpdateTechnicalSupportStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  resolution_note?: string;

  @IsOptional()
  @IsUUID()
  assigned_to_id?: string;
}

export class AddTechnicalSupportNoteDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class TechnicalSupportListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export { TicketSubmitterRole };
