import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import nodemailer from "nodemailer";
import { AppSetting, SmtpSettings } from "./settings.schema";

export interface SmtpSettingsPayload {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass?: string;
  from: string;
}

const SMTP_SETTINGS_KEY = "smtp_credentials";

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel("AppSetting")
    private readonly appSettingModel: Model<AppSetting>,
  ) {}

  private smtpPasswordFromEnv(): string | undefined {
    const raw = process.env.SMTP_PASS;
    if (raw == null) return undefined;
    const s = String(raw).trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      return s.slice(1, -1);
    }
    return s;
  }

  private envFallback(): SmtpSettings {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1"
      : port === 465;
    const user = process.env.SMTP_USER || "";
    return {
      host: process.env.SMTP_HOST || "",
      port,
      secure,
      user,
      pass: this.smtpPasswordFromEnv() || "",
      from: process.env.SMTP_FROM || user,
    };
  }

  private normalizeFromInput(
    input: SmtpSettingsPayload,
    fallbackPassword?: string,
  ): SmtpSettings {
    const port = Number(input.port || 587);
    return {
      host: input.host.trim(),
      port,
      secure: typeof input.secure === "boolean" ? input.secure : port === 465,
      user: input.user.trim().toLowerCase(),
      pass: input.pass?.trim() ? input.pass : fallbackPassword || "",
      from: input.from.trim().toLowerCase(),
    };
  }

  private sanitizeResponse(smtp: SmtpSettings) {
    return {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      user: smtp.user,
      from: smtp.from,
      pass: smtp.pass,
      hasPassword: Boolean(smtp.pass),
    };
  }

  private isTlsVersionError(error: unknown): boolean {
    const message =
      error instanceof Error ? error.message : String(error ?? "");
    return /wrong version number|tls_validate_record_header/i.test(message);
  }

  private buildTransporter(smtp: SmtpSettings, secure: boolean) {
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure,
      auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }

  async createVerifiedSmtpTransporter(smtp: SmtpSettings) {
    const primarySecure = typeof smtp.secure === "boolean" ? smtp.secure : smtp.port === 465;
    const attempts = [primarySecure, !primarySecure].filter(
      (value, index, arr) => arr.indexOf(value) === index,
    );

    let lastError: unknown;
    for (const secure of attempts) {
      const transporter = this.buildTransporter(smtp, secure);
      try {
        await transporter.verify();
        return transporter;
      } catch (error) {
        lastError = error;
        if (!this.isTlsVersionError(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async getStoredSmtp(): Promise<SmtpSettings | null> {
    const setting = await this.appSettingModel
      .findOne({ key: SMTP_SETTINGS_KEY })
      .select("smtp");
    return setting?.smtp || null;
  }

  async getSmtpForMailer(): Promise<SmtpSettings> {
    const stored = await this.getStoredSmtp();
    if (stored?.host && stored?.user && stored?.pass) {
      return stored;
    }
    return this.envFallback();
  }

  async getSmtpForAdmin() {
    const stored = await this.getStoredSmtp();
    if (stored) {
      return {
        source: "database",
        smtp: this.sanitizeResponse(stored),
      };
    }

    const envSmtp = this.envFallback();
    return {
      source: "env",
      smtp: this.sanitizeResponse(envSmtp),
    };
  }

  async upsertSmtp(input: SmtpSettingsPayload, updatedBy?: string) {
    const existing = await this.getStoredSmtp();
    const normalized = this.normalizeFromInput(input, existing?.pass);
    await this.appSettingModel.updateOne(
      { key: SMTP_SETTINGS_KEY },
      {
        $set: {
          key: SMTP_SETTINGS_KEY,
          smtp: normalized,
          updatedBy: updatedBy || "",
        },
      },
      { upsert: true },
    );

    return this.getSmtpForAdmin();
  }
}
