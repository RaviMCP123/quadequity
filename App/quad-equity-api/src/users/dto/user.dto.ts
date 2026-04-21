import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsArray,
} from "class-validator";
import { IsEqualTo } from "../../validators/isEqualTo";

export class UpdateProfileDto {
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
  @IsNotEmpty({ message: "messages.USERNAME_EMPTY" })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: "messages.LANGUAGE_EMPTY" })
  language?: string;

  @IsOptional()
  @IsDateString({}, { message: "messages.DOB_INVALID" })
  dob?: string;

  @IsOptional()
  @IsNotEmpty({ message: "messages.GENDER_EMPTY" })
  gender?: string;

  @IsOptional()
  // @IsNotEmpty({ message: "messages.GENDER_EMPTY" })
  facebookId?: string;

  @IsOptional()
  // @IsNotEmpty({ message: "messages.GENDER_EMPTY" })
  instagramId?: string;

  @IsOptional()
  // @IsNotEmpty({ message: "messages.GENDER_EMPTY" })
  twitterId?: string;

  @IsOptional()
  @IsArray({ message: "messages.MOOD_ARRAY_INVALID" })
  @IsMongoId({ each: true, message: "messages.MOOD_OBJECTID_INVALID" })
  mood?: string[];

  @IsOptional()
  // @IsNotEmpty({ message: "messages.BIO_EMPTY" })
  bio?: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty({ message: "Current password should not be empty." })
  currentPassword: string;

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

export class UpdateNotificationDto {
  @IsNotEmpty({ message: "Current password should not be empty." })
  notification: boolean;
}
