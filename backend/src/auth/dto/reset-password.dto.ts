import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

/** Shared strong-password policy for password-*creation* endpoints. */
const STRONG_PASSWORD = /(?=.*[A-Za-z])(?=.*\d)/;
export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 12 characters and include both letters and numbers.';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  // Accept either field name for backward compatibility with existing clients.
  @IsOptional()
  @IsString()
  @MinLength(12, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(STRONG_PASSWORD, { message: PASSWORD_POLICY_MESSAGE })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(12, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(STRONG_PASSWORD, { message: PASSWORD_POLICY_MESSAGE })
  newPassword?: string;
}

export class ForceChangePasswordDto {
  @IsString()
  @MinLength(12, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(STRONG_PASSWORD, { message: PASSWORD_POLICY_MESSAGE })
  password!: string;
}
