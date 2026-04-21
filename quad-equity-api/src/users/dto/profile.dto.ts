import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsMongoId,
  Length,
  Matches,
} from "class-validator";

export class CreateProfileDto {
  @IsNotEmpty({ message: "Profile name should not be empty." })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty({ message: "Profile type should not be empty." })
  @IsIn(["adult", "kid"], {
    message: "Profile type must be 'adult' or 'kid'",
  })
  profile_type: "adult" | "kid";

  @IsOptional()
  @IsString()
  age_group?: string;

  @IsOptional()
  @IsString()
  @IsIn(["Male", "Female", "Other"], {
    message: "Gender must be 'Male', 'Female', or 'Other'",
  })
  gender?: string;

  @IsOptional()
  @IsString()
  content_language?: string;
}

export class UpdateSubProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Profile name should not be empty." })
  name?: string;

  @IsNotEmpty({ message: "Profile type should not be empty." })
  @IsIn(["adult", "kid"], {
    message: "Profile type must be 'adult' or 'kid'",
  })
  profile_type: "adult" | "kid";

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  age_group?: string;

  @IsOptional()
  @IsString()
  @IsIn(["Male", "Female", "Other"], {
    message: "Gender must be 'Male', 'Female', or 'Other'",
  })
  gender?: string;

  @IsOptional()
  @IsString()
  content_language?: string;
}

export class SetPasscodeDto {
  @IsNotEmpty({ message: "Profile ID should not be empty." })
  profile_id: string;

  @IsNotEmpty({ message: "Passcode should not be empty." })
  @IsString()
  @Length(4, 6, { message: "Passcode must be between 4 and 6 digits." })
  @Matches(/^\d+$/, { message: "Passcode must contain only digits." })
  passcode: string;
}

export class VerifyPasscodeDto {
  @IsNotEmpty({ message: "Profile ID should not be empty." })
  @IsMongoId({ message: "Profile ID must be a valid MongoDB ObjectId." })
  profile_id: string;

  @IsNotEmpty({ message: "Passcode should not be empty." })
  @IsString()
  @Length(4, 6, { message: "Passcode must be between 4 and 6 digits." })
  @Matches(/^\d+$/, { message: "Passcode must contain only digits." })
  passcode: string;
}

export class SwitchProfileDto {
  @IsNotEmpty({ message: "Profile ID should not be empty." })
  @IsMongoId({ message: "Profile ID must be a valid MongoDB ObjectId." })
  profile_id: string;

  @IsOptional()
  @IsString()
  passcode?: string;
}

export interface FormattedProfile {
  _id: string;
  user_id: string;
  name: string;
  image_thumb_url?: string | null;
  profile_type: string;
  age_group: string;
  gender: string;
  content_language: string[];
  is_active: boolean;
}
