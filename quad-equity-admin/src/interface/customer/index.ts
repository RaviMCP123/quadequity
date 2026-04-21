import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface Customer {
  id?: string;
  _id?: string;
  firstName: string;
  mobile_number: string;
  dob: string;
  gender: string;
  image?: string;
  image_thumb_url?: string;
  instagramId?: string;
  facebookId?: string;
  twitterId?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValuesInterface {
  id?: string;
  firstName: string;
  mobile_number: string;
  dob: string;
  gender: string;
  image_thumb_url?: string;
  instagramId?: string;
  facebookId?: string;
  twitterId?: string;
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

export interface CustomerPayload {
  params: ValuesInterface;
  onClose: () => void;
}

export interface CustomerState {
  customer: ValuesInterface[];
  customerDetails: DetailsValuesInterface;
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
  mobile_number?: string;
  gender?: string[];
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
  mobile_number: string;
  dob: string;
  gender: string;
  instagramId?: string;
  facebookId?: string;
  twitterId?: string;
}

export interface AddFormValuesInterface {
  id?: string;
  firstName: string;
  mobile_number: string;
  dob: string;
  gender: string;
  instagramId?: string;
  facebookId?: string;
  twitterId?: string;
}

export interface CustomerAddPayload {
  params: FormData;
  onClose: () => void;
}

export interface DetailsValuesInterface {
  last_login_at?: string;
  id?: string;
  _id?: string;
  userId?: string;
  firstName?: string;
  mobile_number?: string;
  dob?: string;
  gender?: string;
  image_thumb_url?: string;
  instagramId?: string;
  facebookId?: string;
  twitterId?: string;
  analytics?: CustomerAnalyticsData;
}

export interface DetailsApiResponse {
  statusCode: number;
  message: string;
  data: DetailsValuesInterface;
}

export interface CustomerDetailsState {
  customer: DetailsValuesInterface;
}

export interface UpdateProfileImagePayload {
  formData: FormData;
  id?: string;
  closeModal: () => void;
}

export interface UserInterface {
  params: FormValuesInterface;
  onClose: () => void;
}

export interface AllCustomersApiResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    firstName: string;
    mobile_number: string;
  }[];
}

export interface CustomerAnalyticsData {
  videoViews: number;
  audioViews: number;
  watchTime: number; // in seconds
  subscription: {
    planName: string;
    startDate: string;
    endDate: string;
    remainingDays: number;
  } | null;
  lastActive: string | null;
}
