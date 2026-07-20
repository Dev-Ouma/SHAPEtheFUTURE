import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsInt,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';

const REQUESTER_TYPES = ['Staff', 'Student', 'Faculty', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = [
  'Open',
  'Acknowledged',
  'In Progress',
  'On Hold',
  'Resolved',
  'Closed',
  'Cancelled',
];
// Public intake carried over from the merged Complaints & Compliments form.
const FEEDBACK_TYPES = ['service_request', 'complaint', 'compliment'];
const SUBMITTER_TYPES = ['External', 'Student', 'Staff', 'Faculty', 'Other'];
const SUBMISSION_SOURCES = [
  'website',
  'mobile_app',
  'admin',
  'email',
  'unknown',
];

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  @IsIn(PRIORITIES)
  priority?: string;

  @IsOptional()
  @IsString()
  @IsIn(REQUESTER_TYPES)
  requester_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  asset_tag?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachment_urls?: string[];

  // Only used when an admin/ICT agent logs a ticket on behalf of someone else.
  @IsOptional()
  @IsString()
  requester_name?: string;

  @IsOptional()
  @IsEmail()
  requester_email?: string;

  /** Student registration number or staff/faculty ID when logging on behalf. */
  @IsOptional()
  @IsString()
  identification_number?: string;

  @IsOptional()
  @IsString()
  requester_phone?: string;

  /** Helpdesk campus feedback: complaint | compliment. ICT stays service_request. */
  @IsOptional()
  @IsString()
  @IsIn(FEEDBACK_TYPES)
  feedback_type?: string;

  @IsOptional()
  @IsDateString()
  incident_date?: string;

  @IsOptional()
  @IsString()
  @IsIn(SUBMISSION_SOURCES)
  submission_source?: string;

  @IsOptional()
  @IsString()
  client_platform?: string;

  /** Optional lane hint for admin logging when category is unset (helpdesk | it). */
  @IsOptional()
  @IsString()
  @IsIn(['helpdesk', 'it', 'it_technical_support', 'infrastructure'])
  service_group?: string;
}

/**
 * Public "ICT Service Desk" submission from the (formerly campus-feedback) form.
 * Anyone — including anonymous external stakeholders — can submit a complaint,
 * compliment, or service request; it is stored as an IctTicket.
 */
export class SubmitPublicTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  @IsIn(FEEDBACK_TYPES)
  feedback_type?: string;

  @IsOptional()
  @IsString()
  @IsIn(SUBMITTER_TYPES)
  submitter_type?: string;

  // Advisory routing hint from the form ('ICT Technical Support' | 'HelpDesk').
  @IsOptional()
  @IsString()
  service_group?: string;

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

  // The public form ships a static category list (no DB round-trip to render
  // it), so it submits the slug rather than a DB-generated category_id.
  @IsOptional()
  @IsString()
  category_slug?: string;

  @IsOptional()
  @IsString()
  sub_category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  incident_date?: string;

  @IsOptional()
  @IsBoolean()
  consent_given?: boolean;

  @IsOptional()
  @IsBoolean()
  is_anonymous?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachment_urls?: string[];

  @IsOptional()
  @IsString()
  @IsIn(SUBMISSION_SOURCES)
  submission_source?: string;

  @IsOptional()
  @IsString()
  client_platform?: string;
}

export class UpdateTicketStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(STATUSES)
  status: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class AssignTicketDto {
  @IsUUID()
  @IsNotEmpty()
  assignee_id: string;
}

export class AddTicketResponseDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;
}

export class UpsertCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(PRIORITIES)
  default_priority?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sla_hours?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subcategories?: string[];

  @IsOptional()
  @IsUUID()
  default_assignee_id?: string;
}
