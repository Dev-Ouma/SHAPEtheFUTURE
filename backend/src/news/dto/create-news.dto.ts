import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PublishStatus } from '../../common/enums/publish-status.enum';

export class CreateNewsDto {
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
  image_url?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  featured_image_caption?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsString()
  @IsOptional()
  featuredMenuId?: string;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}
