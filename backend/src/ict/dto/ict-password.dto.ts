import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class PasswordTargetDto {
  // Email or username of the account to assist.
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class GrantModuleDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsUUID()
  @IsNotEmpty()
  permission_id: string;

  @IsInt()
  @Min(1)
  @Max(365)
  days: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RevokeGrantDto {
  @IsUUID()
  @IsNotEmpty()
  grant_id: string;
}
