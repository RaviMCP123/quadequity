import { Schema, Document } from "mongoose";

export interface AuditLog extends Document {
  table_id: string;
  table_name: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  action: string;
  userId: string;
  ipAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<AuditLog>(
  {
    table_id: { type: String, required: true },
    table_name: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed, required: false },
    newValue: { type: Schema.Types.Mixed, required: false },
    action: { type: String, required: true },
    userId: { type: String, required: true },
    ipAddress: { type: String, required: true },
  },
  { timestamps: true },
);

AuditLogSchema.set("toJSON", { virtuals: true });
AuditLogSchema.set("toObject", { virtuals: true });

export default AuditLogSchema;
