import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreatePeerLearnerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  schoolId?: string;
}

export class UpdatePeerLearnerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  schoolId?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
