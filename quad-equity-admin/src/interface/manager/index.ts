import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface ManagerValuesInterface {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  email: string;
  phone_number: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: {
    fileUrl: string; results: ManagerValuesInterface[]; pagination: Pagination 
};
}

export interface ManagerListApiResponse {
  statusCode: number;
  message: string;
  data: ManagerValuesInterface[];
}

export interface ManagerPayload {
  params: ManagerValuesInterface;
  onClose: () => void;
}

export interface TableComponentProps {
  data: ManagerValuesInterface[];
  datePagination: Pagination;
  onEditActionHandler: (key: string) => void;
  onDeleteActionHandler?: (key: string) => void;
  onPaginationActionHandler: (params: {
    page: number;
    pageSize: number;
  }) => void;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<ManagerValuesInterface> | null;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  setSortedInfo: (value: SorterResult<ManagerValuesInterface> | null) => void;
  currentPage: number;
  pageSize: number;
  filter: boolean;
}

export interface TableFilterParams {
  updatedAt: string[];
  name: string[];
  email: string[];
  phone_number: string[];
  status: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: ManagerValuesInterface;
}
