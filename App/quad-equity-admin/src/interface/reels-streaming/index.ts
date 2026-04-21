import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface ValuesInterface {
  id?: string;
  video_url: string;
  thumbnail_image?: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
    image_thumb_url?: string;
    phone?: string;
    number?: string;
    mobile?: string;
  };
  description?: string;
  hashtags?: Array<{ name?: string }>;
  mentions?: string[];
  followerCount?: number;
  total_views?: number;
  total_likes?: number;
  download_link?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  status: boolean;
  createdAt?: string;
}

export interface ReelCommentUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  image_thumb_url?: string;
}

export interface ReelComment {
  _id?: string;
  comment?: string;
  message?: string;
  text?: string;
  createdAt?: string;
  userId?: ReelCommentUser;
  user?: ReelCommentUser;
}

export interface ReelCommentsApiResponse {
  statusCode?: number;
  message?: string;
  data?: ReelComment[] | { results?: ReelComment[]; comments?: ReelComment[] };
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface TableFilterParams {
  user_name: string[];
  video_url?: string[];
  status: string[];
  createdAt: string;
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
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
}
