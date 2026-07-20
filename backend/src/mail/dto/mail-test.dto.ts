import { IsEmail, IsOptional } from 'class-validator';

export class MailTestDto {
  @IsOptional()
  @IsEmail()
  to?: string;
}
