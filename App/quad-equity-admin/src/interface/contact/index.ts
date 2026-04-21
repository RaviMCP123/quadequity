export interface MultilingualTitle {
  [languageCode: string]: string;
}

export interface ContactUsContent {
  id?: string;
  _id?: string;
  account_holder_id?: string;
  
  // Page Header
  pageTitle?: MultilingualTitle;
  pageDescription?: MultilingualTitle;
  showPageTitle?: boolean;
  showPageDescription?: boolean;
  
  // Contact Information
  email?: string;
  showEmail?: boolean;
  phone?: string;
  showPhone?: boolean;
  address?: MultilingualTitle;
  showAddress?: boolean;
  
  // Support Section
  customerSupportTitle?: MultilingualTitle;
  customerSupportDescription?: MultilingualTitle;
  showCustomerSupport?: boolean;
  feedbackTitle?: MultilingualTitle;
  feedbackDescription?: MultilingualTitle;
  showFeedback?: boolean;
  mediaTitle?: MultilingualTitle;
  mediaDescription?: MultilingualTitle;
  showMedia?: boolean;
  
  // Form Section
  formTitle?: MultilingualTitle;
  showFormTitle?: boolean;
  
  // Form Fields
  firstNameLabel?: MultilingualTitle;
  firstNamePlaceholder?: MultilingualTitle;
  showFirstName?: boolean;
  lastNameLabel?: MultilingualTitle;
  lastNamePlaceholder?: MultilingualTitle;
  showLastName?: boolean;
  emailLabel?: MultilingualTitle;
  emailPlaceholder?: MultilingualTitle;
  showFormEmail?: boolean;
  phoneLabel?: MultilingualTitle;
  phonePlaceholder?: MultilingualTitle;
  showFormPhone?: boolean;
  messageLabel?: MultilingualTitle;
  messagePlaceholder?: MultilingualTitle;
  showMessage?: boolean;
  submitButtonText?: MultilingualTitle;
  
  slug?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactUsPayload {
  params: ContactUsContent;
  onClose: () => void;
}

export interface ContactUsApiResponse {
  statusCode: number;
  message: string;
  data: ContactUsContent;
}

export interface FormProps {
  isOpen: boolean;
  closeModal: () => void;
  item: ContactUsContent;
}
