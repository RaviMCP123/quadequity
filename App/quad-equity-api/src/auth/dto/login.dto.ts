import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
} from "class-validator";
import { IsEqualTo } from "../../validators/isEqualTo";

export class LoginDto {
  @IsNotEmpty({ message: "Username should not be empty." })
  username: string;

  @IsNotEmpty({ message: "Password should not be empty." })
  password: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: "Username should not be empty." })
  username: string;

  @IsOptional()
  type: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: "Username should not be empty." })
  username: string;

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

  @IsOptional()
  type: string;
}
