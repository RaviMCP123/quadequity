import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
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
