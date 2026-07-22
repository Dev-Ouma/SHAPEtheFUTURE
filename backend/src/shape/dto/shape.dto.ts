import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  IsArray,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  short_name?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  website_url?: string;

  @IsString()
  @IsOptional()
  consortium_role?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contact_person?: string;

  @IsEmail()
  @IsOptional()
  contact_email?: string;

  @IsString()
  @IsOptional()
  contact_role?: string;

  @IsString()
  @IsOptional()
  responsibilities?: string;

  @IsString()
  @IsOptional()
  deliverables?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsIn(['east_africa', 'europe'])
  @IsOptional()
  region?: 'east_africa' | 'europe';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateWorkPackageDto {
  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  objectives?: string;

  @IsString()
  @IsOptional()
  leader_partner_id?: string;

  @IsArray()
  @IsOptional()
  partner_ids?: string[];

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  progress_percent?: number;

  @IsIn(['not_started', 'in_progress', 'completed', 'at_risk'])
  @IsOptional()
  status?: 'not_started' | 'in_progress' | 'completed' | 'at_risk';

  @IsString()
  @IsOptional()
  milestones?: string;

  @IsString()
  @IsOptional()
  deliverables?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeEventDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  event_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  host_partner_id?: string;

  @IsIn(['planned', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';

  @IsString()
  @IsOptional()
  agenda?: string;

  @IsString()
  @IsOptional()
  minutes_url?: string;

  @IsString()
  @IsOptional()
  presentations_url?: string;

  @IsString()
  @IsOptional()
  attendance_notes?: string;

  @IsString()
  @IsOptional()
  outcomes?: string;

  @IsArray()
  @IsOptional()
  gallery_urls?: string[];

  @IsString()
  @IsOptional()
  gallery_category?: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  captions_url?: string;

  @IsString()
  @IsOptional()
  transcript?: string;

  @IsString()
  @IsOptional()
  sign_language_url?: string;

  @IsString()
  @IsOptional()
  work_package_id?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeDocumentDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  @IsOptional()
  description_sw?: string;

  @IsIn([
    'deliverables',
    'reports',
    'minutes',
    'financial',
    'presentations',
    'policy_briefs',
    'publications',
    'templates',
    'other',
  ])
  @IsOptional()
  category?: 'deliverables' | 'reports' | 'minutes' | 'financial' | 'presentations' | 'policy_briefs' | 'publications' | 'templates' | 'other';

  @IsString()
  @IsOptional()
  file_url?: string;

  @IsString()
  @IsOptional()
  file_type?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  file_size?: number;

  @IsString()
  @IsOptional()
  captions_url?: string;

  @IsString()
  @IsOptional()
  transcript?: string;

  @IsString()
  @IsOptional()
  sign_language_url?: string;

  @IsString()
  @IsOptional()
  work_package_id?: string;

  @IsString()
  @IsOptional()
  partner_id?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsOptional()
  published_at?: string | Date;
}

export class CreateShapePressDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  source: string;

  @IsString()
  @IsOptional()
  source_sw?: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeActivityDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsIn(['completed', 'in_progress', 'planned', 'delayed'])
  @IsOptional()
  status?: 'completed' | 'in_progress' | 'planned' | 'delayed';

  @IsString()
  @IsOptional()
  work_package_id?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  progress_percent?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeKpiDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsIn(['overview', 'engagement', 'outputs', 'budget'])
  @IsOptional()
  category?: 'overview' | 'engagement' | 'outputs' | 'budget';

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeRiskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  likelihood?: 'low' | 'medium' | 'high';

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  impact?: 'low' | 'medium' | 'high';

  @IsIn(['open', 'mitigating', 'closed'])
  @IsOptional()
  status?: 'open' | 'mitigating' | 'closed';

  @IsString()
  @IsOptional()
  mitigation?: string;

  @IsString()
  @IsOptional()
  owner?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;
}

export class CreateShapeSdlcDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  objectives?: string;

  @IsString()
  @IsOptional()
  outputs?: string;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  progress_percent?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsIn(['not_started', 'in_progress', 'completed', 'at_risk'])
  @IsOptional()
  status?: 'not_started' | 'in_progress' | 'completed' | 'at_risk';

  @IsArray()
  @IsOptional()
  document_urls?: string[];

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CreateShapeContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}

export class UpdateShapeContactStatusDto {
  @IsIn(['new', 'read', 'replied'])
  status: 'new' | 'read' | 'replied';
}

export const SHAPE_MANAGE_PERMS = ['shape.manage', 'pages.manage'] as const;
export const SHAPE_VIEW_PERMS = [
  'shape.manage',
  'shape.view',
  'pages.manage',
  'pages.view',
] as const;

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
