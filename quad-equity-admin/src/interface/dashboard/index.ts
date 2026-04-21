export interface AppAnalytics {
  totalUsers?: number;
}

export interface InvoiceByStatus {
  pending?: number;
  complete?: number;
  cancel?: number;
  rejected?: number;
}

/** One point in the invoice trend (e.g. per month). Used for line chart. */
export interface InvoiceTrendItem {
  period: string;
  count: number;
  amount: number;
}

/** Per-school stats for dashboard chart (total amount + invoice count). */
export interface SchoolStatItem {
  schoolName: string;
  totalAmount: number;
  invoiceCount: number;
}

/** Invoice count and amount per status per period (for status line chart). */
export interface InvoiceStatusTrendItem {
  period: string;
  pending?: number;
  complete?: number;
  cancel?: number;
  rejected?: number;
  pendingAmount?: number;
  completeAmount?: number;
  cancelAmount?: number;
  rejectedAmount?: number;
}

export interface PayNowPayLaterData {
  payNowCount?: number;
  payLaterCount?: number;
  payNowAmount?: number;
  payLaterAmount?: number;
}

export interface DashboardData {
  appAnalytics?: AppAnalytics;
  schoolCount?: number;
  accountHolderCount?: number;
  invoiceListingCount?: number;
  invoiceAmountTotal?: number;
  invoice_graph?: InvoiceTrendItem[];
  invoice_status_graph?: InvoiceStatusTrendItem[];
  school_graph?: SchoolStatItem[];
  payNowCount?: number;
  payLaterCount?: number;
  payNowPayLater?: PayNowPayLaterData;
}

export interface EasyLodgeStat {
  label: string;
  value: string | number;
  icon: string;
}

export interface DashboardState {
  dashboard: DashboardData | null;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
}

export interface ReportInterface {
  name: string;
  data: number[];
}
