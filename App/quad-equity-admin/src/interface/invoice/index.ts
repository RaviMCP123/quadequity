import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface InvoiceSchoolRef {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  abn?: string;
  image_thumb_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceAccountHolderRef {
  _id?: string;
  id?: string;
  name: string;
  address?: string;
  email?: string;
  phone_number?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceValuesInterface {
  _id?: string;
  id?: string;
  school_id: InvoiceSchoolRef;
  account_holder_id: InvoiceAccountHolderRef;
  invoice_number?: string;
  total_amount: number | string;
  due_date: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: InvoiceValuesInterface[]; pagination: Pagination };
}

export interface SchoolFilterOption {
  id: string;
  name: string;
}

export interface AccountHolderFilterOption {
  id: string;
  name: string;
}

export interface TableComponentProps {
  data: InvoiceValuesInterface[];
  datePagination: Pagination;
  onPaginationActionHandler: (params: {
    page: number;
    pageSize: number;
  }) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<InvoiceValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<InvoiceValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
  schoolList?: SchoolFilterOption[];
  accountHolderList?: AccountHolderFilterOption[];
}

export interface TableFilterParams {
  updatedAt?: string[] | null;
  school_name?: string[] | null;
  account_holder?: string[] | null;
  school_id?: string[] | null;
  account_holder_id?: string[] | null;
  invoice_number?: string[] | null;
  status?: string[] | null;
  due_date?: string[] | null;
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}
