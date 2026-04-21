import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog } from "./audit-log.schema";
import { CreateAuditLogDto } from "./dto/audit-log.dto";

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel("AuditLog")
    private auditLogModel: Model<AuditLog>,
  ) {}

  /**
   * Creates a new audit log entry in the database.
   *
   * @param request - The audit log details including:
   *   - table_id: ID of the affected record
   *   - table_name: Name of the table/module
   *   - oldValue: Previous state of the entity (if applicable)
   *   - newValue: Current state of the entity (if applicable)
   *   - action: Type of action performed (CREATE, UPDATE, DELETE, etc.)
   *   - userId: The ID of the user who performed the action
   *   - ipAddress: IP address of the request origin
   *
   * @returns Promise<boolean> - Returns true if the audit log was saved successfully
   */
  async createAudit(request: CreateAuditLogDto): Promise<boolean> {
    const newEntity = new this.auditLogModel(request);
    await newEntity.save();
    return true;
  }
}
