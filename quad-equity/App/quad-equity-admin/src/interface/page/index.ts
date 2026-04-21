import { Pagination } from "../common";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
export interface MultilingualTitle {
  [languageCode: string]: string;
}

// FAQ Question Interface
export interface FaqQuestion {
  question: MultilingualTitle;
  answer: MultilingualTitle;
}

// FAQ Section Interface
export interface FaqSection {
  heading: MultilingualTitle;
  questions: FaqQuestion[];
}

// Page Section Interface (for dynamic Page Template)
export interface PageSection {
  /** Legacy; page template UI uses description + image + optional CTA only. */
  title?: MultilingualTitle;
  subtitle?: MultilingualTitle;
  description: MultilingualTitle;
  images?: string[]; // Array of image URLs
  buttonText?: MultilingualTitle; // Button text for redirect
  buttonUrl?: string; // URL or page slug to redirect to
}

export interface ValuesInterface {
  id?: string;
  title: MultilingualTitle | string;
  status: boolean;
  description: MultilingualTitle | string;
  category?: string; // "contact-us" | "faq" | "how-it-works" | "for-school" | "for-parent"
  placement?: string; // "header" | "footer" | "both" | "banner"
  sortOrder?: number; // Order for sorting within placement
  manager?: string; // Manager/Account Holder ID
  slug?: string;
  templateKey?: string; // Template identifier (e.g., "HOW_IT_WORKS_V1")
  content?: Record<string, MultilingualTitle | string | string[]>; // Template-specific content
  // Contact Us fields
  email?: string;
  phone?: string;
  address?: MultilingualTitle;
  customerSupportTitle?: MultilingualTitle;
  customerSupportDescription?: MultilingualTitle;
  feedbackTitle?: MultilingualTitle;
  feedbackDescription?: MultilingualTitle;
  mediaTitle?: MultilingualTitle;
  mediaDescription?: MultilingualTitle;
  formTitle?: MultilingualTitle;
  submitButtonText?: MultilingualTitle;
  showFirstName?: boolean;
  showLastName?: boolean;
  showPhoneNumber?: boolean;
  showEmail?: boolean;
  showSchoolName?: boolean;
  showJobTitle?: boolean;
  showComments?: boolean;
  // FAQ fields
  faqSections?: FaqSection[];
  // Page Template fields
  pageSections?: PageSection[];
  // Terms & Conditions Template fields
  termsSections?: PageSection[];
  // SEO fields
  metaTitle?: string | MultilingualTitle;
  metaDescription?: string | MultilingualTitle;
  customSlug?: string;
  schemaMarkup?: string; // JSON-LD schema markup
  robotsIndex?: boolean; // Whether to index this page (default: true)
  robotsFollow?: boolean; // Whether to follow links (default: true)
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: { results: ValuesInterface[]; pagination: Pagination };
}

export interface PagePayload {
  params: FormValuesInterface | FormData;
  onClose: () => void;
  id?: string; // Optional ID for update operations
}

export interface PageState {
  page: ValuesInterface[];
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
}

export interface TableFilterParams {
  updatedAt: string;
  title: string;
  status: string[];
  pageSize: number;
  page: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: FormValuesInterface;
  existingPages?: ValuesInterface[]; // To filter out already used categories
}

export interface FormValuesInterface {
  id?: string;
  title: string | MultilingualTitle;
  description: string | MultilingualTitle;
  category?: string; // "contact-us" | "faq" | "how-it-works" | "for-school" | "for-parent"
  placement?: string; // "header" | "footer" | "both" | "banner"
  sortOrder?: number; // Order for sorting within placement
  manager?: string; // Manager/Account Holder ID
  slug?: string;
  templateKey?: string; // Template identifier (e.g., "HOW_IT_WORKS_V1")
  content?: Record<string, MultilingualTitle | string | string[]>; // Template-specific content
  // Contact Us Left Content (only for category === "contact-us")
  email?: string;
  phone?: string;
  address?: MultilingualTitle;
  customerSupportTitle?: MultilingualTitle;
  customerSupportDescription?: MultilingualTitle;
  feedbackTitle?: MultilingualTitle;
  feedbackDescription?: MultilingualTitle;
  mediaTitle?: MultilingualTitle;
  mediaDescription?: MultilingualTitle;
  // Contact Us Right Side (Form)
  formTitle?: MultilingualTitle;
  submitButtonText?: MultilingualTitle;
  // Contact Us Form Field Visibility (only for category === "contact-us")
  showFirstName?: boolean;
  showLastName?: boolean;
  showPhoneNumber?: boolean;
  showEmail?: boolean;
  showSchoolName?: boolean;
  showJobTitle?: boolean;
  showComments?: boolean;
  // FAQ Specific Fields (only for category === "faq")
  faqSections?: FaqSection[];
  // Page Template Specific Fields (for dynamic sections)
  pageSections?: PageSection[];
  // SEO fields
  metaTitle?: string | MultilingualTitle;
  metaDescription?: string | MultilingualTitle;
  customSlug?: string;
  schemaMarkup?: string; // JSON-LD schema markup
  robotsIndex?: boolean; // Whether to index this page (default: true)
  robotsFollow?: boolean; // Whether to follow links (default: true)
}
