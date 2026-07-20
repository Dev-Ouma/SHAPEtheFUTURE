import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateKbArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}

export class UpdateKbArticleDto extends PartialType(CreateKbArticleDto) {}

export class KbFeedbackDto {
  @IsString()
  @IsIn(['yes', 'no'])
  vote: string;
}
