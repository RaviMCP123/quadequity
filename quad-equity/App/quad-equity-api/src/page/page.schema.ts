import { Schema, Document, Types } from "mongoose";

// FAQ Question Interface
export interface FaqQuestion {
  question: { [langCode: string]: string };
  answer: { [langCode: string]: string };
}

// FAQ Section Interface
export interface FaqSection {
  heading: { [langCode: string]: string };
  questions: FaqQuestion[];
}

export interface Page extends Document {
  account_holder_id?: Types.ObjectId;
  title: string; // Simple string, not multilingual
  description: string; // Simple string, not multilingual
  category?: string;
  slug?: string;
  status?: boolean;
  templateKey?: string; // For template-based pages (how-it-works, for-school, for-parent)
  content?: Record<string, any>; // Template-specific content (for template-based pages)
  pageSections?: Array<{
    title?: { [langCode: string]: string };
    subtitle?: { [langCode: string]: string };
    description?: { [langCode: string]: string };
    images?: string[];
  }>; // Page sections array (for PAGE_TEMPLATE_V1)
  // Blog sections (for BLOG_TEMPLATE_V1 template)
  blogSections?: Array<{
    title?: { [langCode: string]: string };
    description?: { [langCode: string]: string };
    images?: string[];
  }>;
  // Blog specific fields
  author?: string;
  featuredImage?: string;
  publishedDate?: string;
  tags?: string[];
  // Banner fields (for PAGE_TEMPLATE_V1 template)
  bannerTitle?: { [langCode: string]: string };
  bannerDescription?: { [langCode: string]: string };
  bannerImage?: string;
  // FAQ Specific Fields (only when category === "faq")
  faqSections?: FaqSection[];
  // Contact Us Left Content
  email?: string;
  phone?: string;
  address?: { [langCode: string]: string };
  customerSupportTitle?: { [langCode: string]: string };
  customerSupportDescription?: { [langCode: string]: string };
  feedbackTitle?: { [langCode: string]: string };
  feedbackDescription?: { [langCode: string]: string };
  mediaTitle?: { [langCode: string]: string };
  mediaDescription?: { [langCode: string]: string };
  // Contact Us Right Side
  formTitle?: { [langCode: string]: string };
  submitButtonText?: { [langCode: string]: string };
  // Form Field Visibility
  showFirstName?: boolean;
  showLastName?: boolean;
  showPhoneNumber?: boolean;
  showEmail?: boolean;
  showSchoolName?: boolean;
  showJobTitle?: boolean;
  showComments?: boolean;
  // Footer Template Fields (for footer-template)
  copyrightText?: { [langCode: string]: string };
  footerDescription?: { [langCode: string]: string };
  footerLinks?: { [langCode: string]: string };
  quickLinks?: { [langCode: string]: string };
  quickLinksTitle?: { [langCode: string]: string };
  socialLinksTitle?: { [langCode: string]: string };
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  // SEO Fields
  metaTitle?: { [langCode: string]: string };
  metaDescription?: { [langCode: string]: string };
  customSlug?: string;
  schemaMarkup?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// FAQ Question Schema (nested, no _id)
const FaqQuestionSchema = new Schema<FaqQuestion>(
  {
    question: { type: Map, of: String, required: true },
    answer: { type: Map, of: String, required: true },
  },
  { _id: false },
);

// FAQ Section Schema (nested, no _id)
const FaqSectionSchema = new Schema<FaqSection>(
  {
    heading: { type: Map, of: String, required: true },
    questions: { type: [FaqQuestionSchema], default: [] },
  },
  { _id: false },
);

const PageSchema = new Schema<Page>(
  {
    account_holder_id: {
      type: Schema.Types.ObjectId,
      ref: "AccountHolder",
      required: false,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      // enum: [
      //   "contact-us",
      //   "faq",
      //   "how-it-works",
      //   "privacy-policy",
      //   "terms-and-conditions",
      //   "homepage",
      //   "for-school",
      //   "for-parent"
      // ],
      required: false,
    },
    slug: { type: String, required: false, unique: true, sparse: true },
    status: { type: Boolean, default: true },
    templateKey: { type: String, required: false },
    content: { type: Schema.Types.Mixed, required: false }, // Template-specific content
    pageSections: { type: Schema.Types.Mixed, required: false }, // Page sections array (for PAGE_TEMPLATE_V1)
    // Blog sections (for BLOG_TEMPLATE_V1 template)
    blogSections: { type: Schema.Types.Mixed, required: false },
    // Blog specific fields
    author: { type: String, required: false },
    featuredImage: { type: String, required: false },
    publishedDate: { type: String, required: false },
    tags: { type: [String], required: false },
    // Banner fields (for PAGE_TEMPLATE_V1 template)
    bannerTitle: { type: Map, of: String, required: false },
    bannerDescription: { type: Map, of: String, required: false },
    bannerImage: { type: String, required: false },
    // FAQ Specific Fields (only when category === "faq")
    faqSections: { type: [FaqSectionSchema], default: [] },
    // Contact Us Left Content
    email: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: Map, of: String, required: false },
    customerSupportTitle: { type: Map, of: String, required: false },
    customerSupportDescription: { type: Map, of: String, required: false },
    feedbackTitle: { type: Map, of: String, required: false },
    feedbackDescription: { type: Map, of: String, required: false },
    mediaTitle: { type: Map, of: String, required: false },
    mediaDescription: { type: Map, of: String, required: false },
    // Contact Us Right Side
    formTitle: { type: Map, of: String, required: false },
    submitButtonText: { type: Map, of: String, required: false },
    // Form Field Visibility
    showFirstName: { type: Boolean, default: true },
    showLastName: { type: Boolean, default: true },
    showPhoneNumber: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: true },
    showSchoolName: { type: Boolean, default: true },
    showJobTitle: { type: Boolean, default: true },
    showComments: { type: Boolean, default: true },
    // Footer Template Fields (for footer-template)
    copyrightText: { type: Map, of: String, required: false },
    footerDescription: { type: Map, of: String, required: false },
    footerLinks: { type: Map, of: String, required: false },
    quickLinks: { type: Map, of: String, required: false },
    quickLinksTitle: { type: Map, of: String, required: false },
    socialLinksTitle: { type: Map, of: String, required: false },
    facebookUrl: { type: String, required: false },
    instagramUrl: { type: String, required: false },
    linkedinUrl: { type: String, required: false },
    twitterUrl: { type: String, required: false },
    // SEO Fields
    metaTitle: { type: Map, of: String, required: false },
    metaDescription: { type: Map, of: String, required: false },
    customSlug: { type: String, required: false, trim: true, lowercase: true, sparse: true },
    schemaMarkup: { type: String, required: false, default: "" },
    robotsIndex: { type: Boolean, required: false, default: true },
    robotsFollow: { type: Boolean, required: false, default: true },
  },
  { timestamps: true },
);

PageSchema.set("toJSON", { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    // Convert _id to string
    if (ret._id) {
      ret._id = ret._id.toString();
    }
    return ret;
  }
});
PageSchema.set("toObject", { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    // Convert _id to string
    if (ret._id) {
      ret._id = ret._id.toString();
    }
    return ret;
  }
});

export default PageSchema;
