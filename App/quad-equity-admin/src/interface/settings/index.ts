export interface SmtpCredentialView {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  pass?: string;
  hasPassword: boolean;
}

export interface EmailCredentialsData {
  source: "database" | "env";
  smtp: SmtpCredentialView;
}

export interface EmailCredentialsResponse {
  statusCode: number;
  message: string;
  data: EmailCredentialsData;
}

export interface UpdateEmailCredentialsInput {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  from: string;
  pass?: string;
}

export interface TestEmailInput {
  to: string;
}
