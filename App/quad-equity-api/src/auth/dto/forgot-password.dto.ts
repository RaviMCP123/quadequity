import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Please enter a valid email address." })
  @MaxLength(100)
  username: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: "Please enter a valid email address." })
  @MaxLength(100)
  username: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "OTP must be a 6-digit number." })
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Please enter a valid email address." })
  @MaxLength(100)
  username: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
    message:
      "Password must contain uppercase, lowercase, number, and special character.",
  })
  password: string;
}
