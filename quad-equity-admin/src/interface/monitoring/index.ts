import { Pagination } from "../common";

export interface EventLogSchoolRef {
  _id?: string;
  id?: string;
  name?: string;
  image_thumb_url?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  abn?: string;
}

export interface EventLogAccountHolderRef {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
}

export interface EventLogRow {
  _id?: string;
  id?: string;
  invoice_number?: string;
  school_id?: string | EventLogSchoolRef;
  account_holder_id?: string | EventLogAccountHolderRef;
  event_type?: string;
  event_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventLogApiResponse {
  statusCode: number;
  message: string;
  data: {
    results: EventLogRow[];
    pagination: Pagination;
    fileUrl?: string;
  };
}
