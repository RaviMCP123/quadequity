import { IsString, IsOptional, IsObject } from "class-validator";

export class CreateAuditLogDto {
  @IsString()
  table_id: string;

  @IsString()
  table_name: string;

  @IsOptional()
  @IsObject()
  oldValue?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newValue?: Record<string, any>;

  @IsString()
  action: string;

  @IsString()
  userId: string;

  @IsString()
  ipAddress: string;
}
