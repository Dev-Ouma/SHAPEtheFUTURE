import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { MaintenanceMode } from '../entities/maintenance-setting.entity';

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceMode)
  mode: MaintenanceMode;

  @IsString()
  @IsOptional()
  message?: string;

  @IsDateString()
  @IsOptional()
  starts_at?: string;

  @IsDateString()
  @IsOptional()
  ends_at?: string;

  @IsBoolean()
  @IsOptional()
  is_emergency?: boolean;

  @IsArray()
  @IsOptional()
  allowed_modules?: string[];
}
