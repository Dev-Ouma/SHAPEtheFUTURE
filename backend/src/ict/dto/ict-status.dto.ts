import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

const SYSTEM_STATUSES = [
  'Operational',
  'Degraded',
  'Partial Outage',
  'Major Outage',
  'Maintenance',
];
const INCIDENT_TYPES = ['Incident', 'Maintenance'];
const INCIDENT_IMPACTS = ['Minor', 'Major', 'Critical', 'Maintenance'];
const INCIDENT_STATUSES = [
  'Investigating',
  'Identified',
  'Monitoring',
  'Resolved',
  'Scheduled',
  'In Progress',
  'Completed',
];

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_STATUSES)
  status?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateSystemDto extends PartialType(CreateSystemDto) {}

export class UpdateSystemStatusDto {
  @IsString()
  @IsIn(SYSTEM_STATUSES)
  status: string;
}

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUUID()
  system_id?: string;

  @IsOptional()
  @IsString()
  @IsIn(INCIDENT_TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(INCIDENT_IMPACTS)
  impact?: string;

  @IsOptional()
  @IsString()
  @IsIn(INCIDENT_STATUSES)
  status?: string;

  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @IsOptional()
  @IsDateString()
  ends_at?: string;

  // Initial update message describing the incident.
  @IsOptional()
  @IsString()
  message?: string;

  // Optionally set the affected system's status when opening the incident.
  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_STATUSES)
  system_status?: string;
}

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {}

export class AddIncidentUpdateDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  @IsIn(INCIDENT_STATUSES)
  status?: string;

  // Optionally update the affected system's status with this timeline entry.
  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_STATUSES)
  system_status?: string;
}
