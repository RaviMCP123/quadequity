import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ValuesInterface {
  id?: string;
  title: string;
  ad_type: string;
  placement: string;
  content_type: string;
  platform?: string;
  advertisement_link?: string;
  image_url?: string;
  video_url?: string;
  start_date?: string;
  end_date?: string;
  priority?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValuesInterface {
  id?: string;
  title: MultilingualTitle;
  ad_type: string;
  placement: string;
  content_type: string;
  platform?: string;
  advertisement_link?: string;
  image_file?: File | string;
  video_file?: File | string;
  start_date?: string;
  end_date?: string;
}

export interface DetailsValuesInterface {
  id?: string;
  title?: MultilingualTitle;
  ad_type?: string;
  placement?: string;
  content_type?: string;
  platform?: string;
  advertisement_link?: string;
  image_original_url?: string;
  video_url?: string;
  start_date?: string;
  end_date?: string;
  status?: boolean;
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

export interface AdvertisementPayload {
  params: FormData;
  onClose: () => void;
}

export interface AdvertisementState {
  advertisement: ValuesInterface[];
  advertisementDetails: FormValuesInterface;
  advertisementInformation: DetailsValuesInterface;
  pagination: Pagination;
  isLoading: boolean;
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
  onPageActionHandler: (key: string, action: string) => void;
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
  ad_type: string[];
  placement: string[];
  content_type: string[];
  platform: string[];
  start_date: string[];
  end_date: string[];
  status: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface DetailsApiResponse {
  statusCode: number;
  message: string;
  data: FormValuesInterface;
}

export interface ViewApiResponse {
  statusCode: number;
  message: string;
  data: DetailsValuesInterface;
}

export interface AdvertisementDetailsState {
  advertisement: DetailsValuesInterface;
}
