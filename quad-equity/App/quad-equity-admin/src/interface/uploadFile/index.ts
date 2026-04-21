import React from "react";
import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface ValuesInterface {
  video_id?: string;
  audio_id?: string;
  book_id?: string;
  id?: string;
  duration: string;
  content_type: string;
  format: string[];
  size: string;
  quality: string;
  episode: string;
  series: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  upload_id?: string;
  video_thumbnail?: string;
  audio_link?:string;
  audio_link_hls?: string;
  book_link?:string;
  video_link?: {
    [key: string]: string;
  };
  subtitles?: SubtitleInterface[];
  languageAudio?: LanguageAudioInterface[];
  upload_status?: string;
}

export interface SubtitleInterface {
  type?: string;
  fileName?: string;
  languageCode?: string;
  languageName?: string;
  url?: string;
}

export interface LanguageAudioInterface {
  id?: string;
  unique_id?: string;
  fileName?: string;
  languageName?: string;
  languageCode?: string;
  audio_link?: string;
  audio_link_hls?: string;
}

export interface DeleteVideoAudioPayload {
  upload_id: string;
  fileName: string;
}

export interface DeleteSubtitlePayload {
  upload_id: string;
  fileName: string;
}

export interface UploadFileValuesInterface {
  video_id?: string;
  audio_id?: string;
  book_id?: string;
  upload_id?: string;
  content_type: string;
  episode: number;
  quality: string;
  series: number;
  unique_id: string;
  minutes: string | number;
  clips: number;
  size: number;
  languageName?: string;
  languageCode?: string;
  title?: { [key: string]: string };
  description?: { [key: string]: string };
}

export interface AudioFileValuesInterface {
  video_id?: string;
  upload_id?: string;
  unique_id: string;
  languageName?: string;
  languageCode?: string;
}
export interface FormValuesInterface {
  id?: string;
  video_id: string;
  content_type: string;
  language?: string;
  quality: string;
  series: string;
  episode: string;
  clips: string;
  title?: { [key: string]: string };
  description?: { [key: string]: string };
}

export interface UploadFileState {
  uploadFile: ValuesInterface[];
  pagination: Pagination;
  isLoading: boolean;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface UploadFilePayload {
  params: UploadFileValuesInterface;
  video_id?: string;
  type?: string;
  onClose: () => void;
}

export interface UploadVideoAudioFilePayload {
  params: AudioFileValuesInterface;
  video_id?: string;
  type?: string;
  onClose: () => void;
}

export interface UploadSubTitlePayload {
  params: FormData;
  onClose: () => void;
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  id?: string;
  type?: string;
  existingUploads?: ValuesInterface[];
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
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
  onHandleViewAction: (key: string, type: string) => void;
  selectedRowKeys?: React.Key[];
  setSelectedRowKeys?: (keys: React.Key[]) => void;
  allowLanguageAudio?: boolean;
  showSubtitleAction?: boolean;
  showPlayAction?: boolean;
  onPlayAudio?: (src: string, title: string) => void;
}

export interface TableFilterParams {
  video_id: string;
  type: string;
  updatedAt: string;
  status: string[];
  content_type: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}
