import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ValuesInterface {
  id?: string;
  series_title: string;
  episode_title: string;
  language: string[];
  category: string[];
  description: string;
  access_type: string;
  content_type: string;
  add_enabled: string;
  price: number;
  image_thumb_url: string;
  image_original_url: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValuesInterface {
  id?: string;
  series_title: MultilingualTitle;
  episode_title: MultilingualTitle;
  description: MultilingualTitle;
  category: string[];
  language: string[];
  tags: string[];
  access_type: string;
  add_enabled: string;
  sponsorship: string;
  content_type: string;
  show_in: string;
  price: number;
  most_popular: boolean;
  most_like: boolean;
  trading_now: boolean;
  thumbnail_image?: File | string;
}

export interface DetailsValuesInterface {
  total_views?: string;
  total_likes?: string;
  average_rating?: string;
  total_audios?: string;
  id?: string;
  image_thumb_url?: string;
  image_original_url?: string;
  series_title?: MultilingualTitle;
  episode_title?: MultilingualTitle;
  description?: MultilingualTitle;
  category?: string[];
  language?: string[];
  tags?: string[];
  access_type?: string;
  add_enabled?: string;
  sponsorship?: string;
  price?: number;
  most_popular?: boolean;
  most_like?: boolean;
  trading_now?: boolean;
  thumbnail_image?: File | string;
  content_type?: string;
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

export interface AudioPayload {
  params: FormData;
  onClose: () => void;
}

export interface AudioState {
  audio: ValuesInterface[];
  audioDetails: FormValuesInterface;
  audioInformation: DetailsValuesInterface;
  pagination: Pagination;
  isLoading: boolean;
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
  onPageActionHandler: (key: string, action:string) => void;
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
  series_title: string;
  language: string[];
  content_type: string[];
  category: string[];
  add_enabled: string[];
  access_type: string[];
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

export interface AudioDetailsState {
  audio: DetailsValuesInterface;
}
