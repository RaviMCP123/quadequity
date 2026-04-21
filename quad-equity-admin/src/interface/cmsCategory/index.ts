import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface CmsCategoryValuesInterface {
  id?: string;
  name: string;
  slug?: string;
  placement?: string[]; // Array of: "header" | "footer" | "banner"
  manager?: string; // Manager/Account Holder ID
  sortOrder?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsCategoryFormValuesInterface {
  id?: string;
  name: string;
  slug?: string;
  placement?: string[]; // Array of: "header" | "footer" | "banner"
  manager?: string; // Manager/Account Holder ID
  sortOrder?: number;
  status?: boolean;
}

export interface CmsCategoryApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: CmsCategoryValuesInterface[];
    pagination: Pagination;
  };
}

export interface CmsCategoryListApiResponse {
  statusCode: number;
  message: string;
  data: CmsCategoryValuesInterface[];
}

export interface CmsCategoryPayload {
  params: CmsCategoryFormValuesInterface;
  onClose: () => void;
}

export interface CmsCategoryFormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: CmsCategoryFormValuesInterface;
}

export interface CmsCategoryTableFilterParams {
  name?: string[] | null;
  slug?: string[] | null;
  placement?: string[] | null;
  status?: string[] | null;
  updatedAt?: string[] | null;
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface CmsCategoryTableComponentProps {
  data: CmsCategoryValuesInterface[];
  datePagination: Pagination;
  onEditActionHandler: (key: string) => void;
  onDeleteActionHandler?: (key: string) => void;
  onPaginationActionHandler: (params: CmsCategoryTableFilterParams) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<CmsCategoryValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<CmsCategoryValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
}

export interface PlacementSortOrdersResponse {
  statusCode: number;
  message: string;
  data: {
    header?: number;
    footer?: number;
    banner?: number;
    quicklinks?: number;
  };
}