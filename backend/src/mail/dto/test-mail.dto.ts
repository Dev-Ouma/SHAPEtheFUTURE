import { IsEmail, IsOptional, IsString } from 'class-validator';

export class TestMailDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  to?: string;
}
