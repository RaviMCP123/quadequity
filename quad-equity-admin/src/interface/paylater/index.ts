import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export type PayLaterPlan = "daily" | "weekly" | "monthly";

export interface PayLaterSchoolRef {
  _id?: string;
  id?: string;
  name?: string;
  image_thumb_url?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  abn?: string;
}

export interface PayLaterAccountHolderRef {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
}

export interface PayLaterInvoiceListingRef {
  _id?: string;
  id?: string;
  invoice_number?: string;
}

export interface PayLaterValuesInterface {
  _id?: string;
  id?: string;
  invoice_listing_id?: string | PayLaterInvoiceListingRef;
  invoice_number?: string;
  school_id?: string | PayLaterSchoolRef;
  account_holder_id?: string | PayLaterAccountHolderRef;
  plan?: PayLaterPlan;
  installment?: number | string;
  amount?: number | string;
  service_fees?: number | string;
  total_amount?: number | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: PayLaterValuesInterface[]; pagination: Pagination; fileUrl?: string };
}

export interface TableComponentProps {
  data: PayLaterValuesInterface[];
  datePagination: Pagination;
  onPaginationActionHandler: (params: Record<string, unknown>) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<PayLaterValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<PayLaterValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
  schoolList?: { id: string; name: string }[];
  accountHolderList?: { id: string; name: string }[];
}

export interface TableFilterParams {
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
  status?: string[] | null;
  plan?: string[] | null;
  school_id?: string[] | null;
  account_holder_id?: string[] | null;
  [key: string]: unknown;
}
