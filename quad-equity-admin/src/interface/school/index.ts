import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface SchoolValuesInterface {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  website: string;
  abn: string;
  access_key?: string;
  service_fee?: string;
  pay_now?: string;
  image_thumb_url?: string;
  image_original_url?: string;
  attachment_url?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: {
    fileUrl: string; results: SchoolValuesInterface[]; pagination: Pagination 
};
}

export interface SchoolListApiResponse {
  statusCode: number;
  message: string;
  data: SchoolValuesInterface[];
}

export interface SchoolPayload {
  params: FormData;
  onClose: () => void;
}

export interface SchoolState {
  school: SchoolValuesInterface[];
  pagination: Pagination;
  isLoading: boolean;
}

export interface TableComponentProps {
  data: SchoolValuesInterface[];
  datePagination: Pagination;
  onEditActionHandler: (key: string) => void;
  onViewActionHandler?: (key: string) => void;
  onDeleteActionHandler?: (key: string) => void;
  onPaginationActionHandler: (params: {
    page: number;
    pageSize: number;
  }) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<SchoolValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<SchoolValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
}

export interface TableFilterParams {
  updatedAt: string[];
  name: string[];
  email?: string[] | null;
  phone_number?: string[] | null;
  status: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: SchoolValuesInterface;
}

/** School view details – finance overview */
export interface SchoolFinanceOverviewParams {
  schoolId: string;
  term?: string;
  year?: string;
}

export interface SchoolTermHighlight {
  totalTuitionIssued: number;
  totalTuitionIssuedChangePercent?: number;
  payLaterAdoptionPercent: number;
  payLaterAdoptionChangePercent?: number;
  familiesUsingTermly: number;
  familiesUsingTermlyChangePercent?: number;
  tuitionPaidUpfront: number;
  tuitionPaidUpfrontNote?: string;
}

export interface SchoolPaymentAdoption {
  payNowPercent: number;
  payLaterPercent: number;
  termlyAdoptionPercent: number;
}

export interface SchoolCohortRow {
  term?: string;
  year?: string;
  tuitionIssued: number;
  termlyUsers: number;
  tuitionPaidDay?: number;
  tuitionPaidWeekly?: number;
  tuitionPaidMonthly?: number;
  adoptionPercent: number;
  /** @deprecated use tuitionPaidDay */
  tuitionPaidDay1Percent?: number;
  /** @deprecated use yearLevel from API if needed */
  yearLevel?: string;
}

export interface SchoolFinanceOverviewData {
  termHighlights?: SchoolTermHighlight;
  paymentAdoption?: SchoolPaymentAdoption;
  cohorts?: SchoolCohortRow[];
}

export interface SchoolDetailsApiResponse {
  statusCode: number;
  message: string;
  data: SchoolValuesInterface;
}

export interface SchoolFinanceOverviewApiResponse {
  statusCode: number;
  message: string;
  data: SchoolFinanceOverviewData;
}

/** Params for Tuition Performance by Cohort API */
export interface SchoolTuitionPerformanceParams {
  schoolId: string;
  term?: string;
  year?: string;
}

export interface SchoolTuitionPerformanceApiResponse {
  statusCode: number;
  message: string;
  data: SchoolCohortRow[];
}
