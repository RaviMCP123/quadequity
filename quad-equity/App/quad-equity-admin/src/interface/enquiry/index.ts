export interface Enquiry {
  comments: string;
  schoolName: string;
  jobTitle: string;
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt?: string | { $date?: string };
}

export interface EnquiryListResponse {
  data: {
    data: any;
    results: Enquiry[];
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

export interface SendEnquiryEmailPayload {
  id: string;
  subject: string;
  message: string;
}
