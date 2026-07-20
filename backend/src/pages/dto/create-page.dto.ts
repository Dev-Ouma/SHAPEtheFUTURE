import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PublishStatus } from '../../common/enums/publish-status.enum';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  title_sw?: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  content_sw?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  summary_sw?: string;

  @IsString()
  @IsOptional()
  banner_image?: string;

  @IsString()
  @IsOptional()
  parent_slug?: string;

  @IsString()
  @IsOptional()
  meta_title?: string;

  @IsString()
  @IsOptional()
  meta_title_sw?: string;

  @IsString()
  @IsOptional()
  meta_description?: string;

  @IsString()
  @IsOptional()
  meta_description_sw?: string;

  @IsString()
  @IsOptional()
  layout_template?: string;

  @IsString()
  @IsOptional()
  leadership_name?: string;

  @IsString()
  @IsOptional()
  leadership_position?: string;

  @IsOptional()
  layout_data?: any;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}
