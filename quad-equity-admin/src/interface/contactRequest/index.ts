export interface ContactRequest {
  comments: string;
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt?: string | { $date?: string };
}

export interface ContactRequestListResponse {
  data: {
    data: any;
    results: ContactRequest[];
    pagination: {
      total: number;
      page: number;
      currentPage: number;
      limit: number;
    };
  };
  message?: string;
  status?: boolean;
}

export interface SendContactRequestEmailPayload {
  id: string;
  subject: string;
  message: string;
}
