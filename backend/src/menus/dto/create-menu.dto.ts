import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
