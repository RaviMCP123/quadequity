import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ValuesInterface {
  id?: string;
  name: MultilingualTitle;
  description?: MultilingualTitle;
  benefits?: MultilingualTitle;
  video_url?: string;
  video_file?: string;
  duration: string;
  days?: number;
  price: number;
  plan_type: string;
  platform?: string;
  privileges?: string[];
  priority?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValuesInterface {
  id?: string;
  name: MultilingualTitle;
  description?: MultilingualTitle;
  benefits?: MultilingualTitle;
  duration: string;
  days?: number;
  price: number;
  plan_type: string;
  platform?: string;
  privileges?: string[];
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface DetailsApiResponse {
  statusCode: number;
  message: string;
  data: ValuesInterface;
}

export interface ViewApiResponse {
  statusCode: number;
  message: string;
  data: ValuesInterface;
}

export interface SubscriptionPayload {
  params: FormData | Record<string, unknown>;
  onClose: () => void;
}

export interface SubscriptionState {
  subscription: ValuesInterface[];
  pagination: Pagination;
  isLoading: boolean;
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
  onPageActionHandler: (key: string, action: string) => void;
  onPaginationActionHandler: (params: {
    page: number;
    pageSize: number;
  }) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<ValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<ValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
  selectedRowKeys?: React.Key[];
  setSelectedRowKeys?: (keys: React.Key[]) => void;
}

export interface TableFilterParams {
  privileges?: string[] | null;
  name?: string | null;
  duration?: string[] | null;
  plan_type?: string[] | null;
  platform?: string[] | null;
  status?: boolean[] | null;
  updatedAt?: string[] | null;
  createdAt?: string[] | null;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: FormValuesInterface | ValuesInterface;
}

export interface DetailsValuesInterface {
  video: string | undefined;
  id?: string;
  name?: MultilingualTitle;
  description?: MultilingualTitle;
  benefits?: MultilingualTitle;
  video_url?: string;
  video_file?: string;
  duration: string;
  days?: number;
  price: number;
  plan_type: string;
  platform?: string;
  privileges?: string[];
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
