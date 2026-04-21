import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PlacementItemDto {
  @IsNotEmpty({ message: "Placement type is required." })
  @IsEnum(["header", "footer", "banner", "quicklinks"], {
    message: "Placement type must be one of: header, footer, banner, quicklinks.",
  })
  type: "header" | "footer" | "banner" | "quicklinks";

  @IsNotEmpty({ message: "Sort order is required for each placement." })
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: "Sort order must be 0 or greater." })
  sortOrder: number;
}

export class CreateCmsCategoryDto {
  @IsNotEmpty({ message: "Name is required." })
  @IsString()
  @MaxLength(250, { message: "Name must not exceed 250 characters." })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray({ message: "Placement must be an array." })
  @ValidateNested({ each: true })
  @Type(() => PlacementItemDto)
  placement?: PlacementItemDto[];

  @IsOptional()
  @IsString()
  manager?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean;
}

export class UpdateCmsCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(250, { message: "Name must not exceed 250 characters." })
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray({ message: "Placement must be an array." })
  @ValidateNested({ each: true })
  @Type(() => PlacementItemDto)
  placement?: PlacementItemDto[];

  @IsOptional()
  @IsString()
  manager?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean;
}

export class UpdateCmsCategoryStatusDto {
  @IsNotEmpty({ message: "Status is required." })
  @IsBoolean()
  @Type(() => Boolean)
  status: boolean;
}

export class FindAllCmsCategoryQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  placement?: string; // Can be a single value or comma-separated: "header" or "header,footer"

  @IsOptional()
  @IsString()
  status?: string; // Can be "true", "false", or "true-false"

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  sort?: string; // e.g., "name", "sortOrder", "updatedAt"

  @IsOptional()
  @IsEnum(["asc", "desc"])
  direction?: "asc" | "desc";

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
