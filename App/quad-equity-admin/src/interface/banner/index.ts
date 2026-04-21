import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ValuesInterface {
  id?: string;
  title: string;
  image_thumb_url: string;
  image_original_url: string;
  priority?: number;
  status: boolean;
  is_kids?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValuesInterface {
  id?: string;
  title: MultilingualTitle;
  image?: File | string;
  type?: string[];
  category?: string;
  category_id?: string;
  is_kids?: boolean;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface BannerPayload {
  params: FormData;
  onClose: () => void;
}

export interface BannerState {
  banner: ValuesInterface[];
  fetchList: { title: string; id: string }[];
  pagination: Pagination;
  isLoading: boolean;
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
  onEditActionHandler: (key: string) => void;
  onViewActionHandler?: (key: string) => void;
  onDeleteActionHandler?: (key: string) => void;
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
  updatedAt: string;
  title: string;
  status: string[];
  type: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: FormValuesInterface;
}

export interface ApiListResponse {
  statusCode: number;
  message: string;
  data: { title: string; id: string }[];
}
