import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";
import { IsEqualTo } from "../../validators/isEqualTo";

export class AdminUpdateProfileDto {
  @IsNotEmpty({ message: "Admin id is required." })
  id: string;

  @IsOptional()
  @IsNotEmpty({ message: "messages.FIRSTNAME_EMPTY" })
  firstName?: string;

  @IsOptional()
  @IsNotEmpty({ message: "messages.LASTNAME_EMPTY" })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: "messages.EMAIL_INVALID" })
  @IsNotEmpty({ message: "messages.EMAIL_EMPTY" })
  email?: string;

  @IsOptional()
  @IsNotEmpty({ message: "messages.MOBILE_EMPTY" })
  mobile_number?: string;

  @IsOptional()
  @IsArray()
  permission?: string[];
}

export class AdminUpdatePasswordDto {
  @IsNotEmpty({ message: "Admin id is required." })
  id: string;

  @IsNotEmpty({ message: "Password should not be empty." })
  @IsString({ message: "Password must be a string." })
  @Length(8, 20, { message: "Password must be between 8 and 20 characters." })
  @Matches(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  })
  @Matches(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  })
  @Matches(/[0-9]/, { message: "Password must contain at least one number." })
  @Matches(/[\W_]/, {
    message: "Password must contain at least one special character.",
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEqualTo("password", {
    message: "Current password does not match. Please try again.",
  })
  confirmPassword: string;
}

export class UpdateSmtpCredentialsDto {
  @IsNotEmpty({ message: "SMTP host is required." })
  @IsString({ message: "SMTP host must be a string." })
  host: string;

  @IsNotEmpty({ message: "SMTP port is required." })
  @IsInt({ message: "SMTP port must be a number." })
  @Min(1, { message: "SMTP port must be between 1 and 65535." })
  @Max(65535, { message: "SMTP port must be between 1 and 65535." })
  port: number;

  @IsOptional()
  @IsBoolean({ message: "SMTP secure must be a boolean." })
  secure?: boolean;

  @IsNotEmpty({ message: "SMTP username is required." })
  @IsEmail({}, { message: "SMTP username must be a valid email." })
  user: string;

  @IsOptional()
  @IsString({ message: "SMTP password must be a string." })
  pass?: string;

  @IsNotEmpty({ message: "SMTP from email is required." })
  @IsEmail({}, { message: "SMTP from must be a valid email." })
  from: string;
}

export class SmtpTestEmailDto {
  @IsNotEmpty({ message: "Recipient email is required." })
  @IsEmail({}, { message: "Recipient email must be valid." })
  to: string;
}
