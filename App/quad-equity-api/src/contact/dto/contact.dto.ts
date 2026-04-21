import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

/** Public website contact form (matches quad-equity-web payload). */
export class CreatePublicContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;
}

/** Admin list query. */
export class ContactListQueryDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  sort?: string = "createdAt";

  @IsOptional()
  direction?: "asc" | "desc" = "desc";

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
