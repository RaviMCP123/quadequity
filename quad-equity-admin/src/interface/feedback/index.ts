import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketType = "feedback" | "bug_report";

export interface FeedbackTicket {
  id?: string;
  ticketNumber?: string;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  priority?: "low" | "medium" | "high" | "urgent";
  userId?: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  assignedTo?: string;
  assignedToName?: string;
  responses?: TicketResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketResponse {
  id?: string;
  ticketId: string;
  message: string;
  responseType: "email" | "in_app";
  respondedBy?: string;
  respondedByName?: string;
  createdAt?: string;
}

export interface ValuesInterface {
  id?: string;
  ticketNumber?: string;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  priority?: "low" | "medium" | "high" | "urgent";
  userId?: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  assignedTo?: string;
  assignedToName?: string;
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

export interface DetailsApiResponse {
  statusCode: number;
  message: string;
  data: FeedbackTicket;
}

export interface TableFilterParams {
  updatedAt?: string;
  createdAt?: string;
  subject?: string;
  type?: string[];
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  pageSize?: number;
  page?: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface TableComponentProps {
  data: ValuesInterface[];
  datePagination: Pagination;
  onEditActionHandler?: (key: string) => void;
  onViewActionHandler: (key: string) => void;
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

export interface AssignTicketPayload {
  ticketId: string;
  assignedTo: string;
  onClose: () => void;
}

export interface RespondToTicketPayload {
  ticketId: string;
  message: string;
  responseType: "email" | "in_app";
  onClose: () => void;
}

export interface UpdateTicketStatusPayload {
  ticketId: string;
  status: TicketStatus;
  onClose?: () => void;
}

