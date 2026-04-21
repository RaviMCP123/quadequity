import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface ValuesInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile_number: string;
  image_thumb_url?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: ValuesInterface[];
    pagination: Pagination;
    fileUrl?: string;
  };
}

export interface AdminPayload {
  params: ValuesInterface;
  onClose: () => void;
}

export interface AdminState {
  admin: ValuesInterface[];
  adminDetails: DetailsValuesInterface;
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
  updatedAt?: string;
  createdAt?: string;
  firstName?: string;
  email?: string;
  mobile_number?: string;
  status?: string[];
  pageSize?: number;
  page?: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: ValuesInterface;
}

export interface FormValuesInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile_number: string;
  password?: string;
  confirmPassword?: string;
  permission?: string[]
}

export interface AddFormValuesInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile_number: string;
  password?: string;
  confirmPassword?: string;
  permission?: string[];
}

export interface AdminAddPayload {
  params: FormData;
  onClose: () => void;
}

export interface DetailsValuesInterface {
  id?: string;
  firstName?: string;
  lastName?: string;
  image_thumb_url?: string;
  email?: string;
  mobile_number?: string;
  permission?: string[]
}

export interface DetailsApiResponse {
  statusCode: number;
  message: string;
  data: DetailsValuesInterface;
}

export interface AdminDetailsState {
  admin: DetailsValuesInterface;
}

export interface UpdateProfileImagePayload {
  formData: FormData;
  id?: string;
  closeModal: () => void;
}

export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  mobile_number: string;
}

export interface PasswordFormValues {
  id?: string;
  password: string;
  confirmPassword: string;
  currentPassword?: string;
}

export interface UserInterface {
  params: FormValuesInterface;
  onClose: () => void;
}

export interface UserPassword {
  params: PasswordFormValues;
  closeModal: () => void;
}
