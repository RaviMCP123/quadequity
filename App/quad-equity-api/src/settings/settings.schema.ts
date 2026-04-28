import { Document, Schema } from "mongoose";

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface AppSetting extends Document {
  key: string;
  smtp?: SmtpSettings;
  updatedBy?: string;
}

const AppSettingSchema = new Schema<AppSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: "" },
      pass: { type: String, default: "" },
      from: { type: String, default: "" },
    },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

export default AppSettingSchema;
