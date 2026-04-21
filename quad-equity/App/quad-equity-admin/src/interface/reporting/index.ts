import { Pagination } from "../common";

export interface NowVsLaterClickSchoolRef {
  _id?: string;
  id?: string;
  name?: string;
  image_thumb_url?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  abn?: string;
}

export interface NowVsLaterClickAccountHolderRef {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
}

export interface NowVsLaterClickRow {
  _id?: string;
  id?: string;
  invoice_number?: string;
  school_id?: string | NowVsLaterClickSchoolRef;
  account_holder_id?: string | NowVsLaterClickAccountHolderRef;
  click_type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NowVsLaterClickApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: NowVsLaterClickRow[];
    pagination: Pagination;
    payNowCount?: number;
    payLaterCount?: number;
  };
}

export interface NowVsLaterClickFilterParams {
  page?: number;
  limit?: number;
  school_id?: string;
  invoice_number?: string;
  click_type?: string;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface TableFilterParams {
  page: number;
  pageSize: number;
  school_id?: string[] | null;
  invoice_number?: string[] | null;
  click_type?: string[] | null;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

// School-wise Term Amount Report
export interface SchoolWiseTermAmountSchoolRef {
  _id?: string;
  id?: string;
  name?: string;
  image_thumb_url?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  abn?: string;
}

export interface SchoolWiseTermAmountAccountHolderRef {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
}

export interface SchoolWiseTermAmountRow {
  _id?: string;
  id?: string;
  invoice_number?: string;
  school_id?: string | SchoolWiseTermAmountSchoolRef;
  account_holder_id?: string | SchoolWiseTermAmountAccountHolderRef;
  term?: string;
  amount?: number | string;
  invoice_date?: string;
  due_date?: string;
  invoice_file?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolWiseTermAmountApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: SchoolWiseTermAmountRow[];
    pagination: Pagination;
  };
}

// Account Holder Report
export interface AccountHolderReportAccountHolderRef {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
}

export interface AccountHolderReportRow {
  _id?: string;
  id?: string;
  invoice_number?: string;
  account_holder_id?: string | AccountHolderReportAccountHolderRef;
  term?: string;
  amount?: number | string;
  invoice_date?: string;
  due_date?: string;
  invoice_file?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountHolderReportApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: AccountHolderReportRow[];
    pagination: Pagination;
  };
}
