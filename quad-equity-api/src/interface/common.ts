import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Request } from "express";

export interface Query {
  [key: string]: string | number | boolean | object;
}

export interface SelectQuery {
  [key: string]: string | number | boolean | object;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: string | number | boolean | object;
  };
}

export class StatusDto {
  @IsOptional()
  status: boolean;
}

export class BulkDeleteDto {
  @IsNotEmpty({ message: "IDs should not be empty." })
  @IsArray()
  @IsMongoId({
    each: true,
    message: "Each ID must be a valid MongoDB ObjectId.",
  })
  ids: string[];
}
