import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ValuesInterface {
  id?: string;
  title: string;
  is_kids: boolean;
  image_thumb_url: string;
  image_original_url: string;
  priority?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValuesInterface {
  id?: string;
  title: MultilingualTitle;
  image?: File | string;
  is_kids?: boolean;
  type?: string[];
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface ApiListResponse {
  statusCode: number;
  message: string;
  data: ValuesInterface[];
}

export interface CategoryPayload {
  params: FormData;
  onClose: () => void;
}

export interface CategoryState {
  category: ValuesInterface[];
  categoryList: ValuesInterface[]
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
  is_kids: string[];
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
