import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsEnum,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// FAQ Question DTO
export class FaqQuestionDto {
  @IsObject()
  question: { [langCode: string]: string };

  @IsObject()
  answer: { [langCode: string]: string };
}

// FAQ Section DTO
export class FaqSectionDto {
  @IsObject()
  heading: { [langCode: string]: string };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqQuestionDto)
  questions: FaqQuestionDto[];
}

export class PageDto {
  @IsOptional()
  @IsString()
  account_holder_id?: string;

  @IsNotEmpty({ message: "Title should not be empty." })
  @IsString()
  title: string; // Simple string, not multilingual

  @IsNotEmpty({ message: "Description should not be empty." })
  @IsString()
  description: string; // Simple string, not multilingual

  @IsOptional()
  // @IsEnum([
  //   "contact-us",
  //   "faq",
  //   "how-it-works",
  //   "privacy-policy",
  //   "terms-and-conditions",
  //   "homepage",
  //   "for-school",
  //   "for-parent"
  // ])
  category?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  templateKey?: string; // Required for template-based pages (how-it-works, for-school, for-parent)

  @IsOptional()
  @IsObject()
  content?: Record<string, any>; // Template-specific content (for template-based pages)

  // Page Sections (for PAGE_TEMPLATE_V1 template)
  @IsOptional()
  @IsArray()
  pageSections?: Array<{
    title?: { [langCode: string]: string };
    subtitle?: { [langCode: string]: string };
    description?: { [langCode: string]: string };
    images?: string[];
  }>;

  // Blog Sections (for BLOG_TEMPLATE_V1 template)
  @IsOptional()
  @IsArray()
  blogSections?: Array<{
    title?: { [langCode: string]: string };
    description?: { [langCode: string]: string };
    images?: string[];
  }>;

  // Blog specific fields
  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  publishedDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Banner fields (for PAGE_TEMPLATE_V1 template)
  @IsOptional()
  @IsObject()
  bannerTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  bannerDescription?: { [langCode: string]: string };

  @IsOptional()
  @IsString()
  bannerImage?: string;

  // FAQ Specific Fields (only when category === "faq")
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqSectionDto)
  faqSections?: FaqSectionDto[];

  // Contact Us Left Content
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  address?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  customerSupportTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  customerSupportDescription?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  feedbackTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  feedbackDescription?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  mediaTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  mediaDescription?: { [langCode: string]: string };

  // Contact Us Right Side
  @IsOptional()
  @IsObject()
  formTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  submitButtonText?: { [langCode: string]: string };

  // Form Field Visibility
  @IsOptional()
  @IsBoolean()
  showFirstName?: boolean;

  @IsOptional()
  @IsBoolean()
  showLastName?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhoneNumber?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showSchoolName?: boolean;

  @IsOptional()
  @IsBoolean()
  showJobTitle?: boolean;

  @IsOptional()
  @IsBoolean()
  showComments?: boolean;

  // Footer Template Fields (for footer-template)
  @IsOptional()
  @IsObject()
  copyrightText?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  footerDescription?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  footerLinks?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  quickLinks?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  quickLinksTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  socialLinksTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  // SEO Fields
  @IsOptional()
  @IsObject()
  metaTitle?: { [langCode: string]: string };

  @IsOptional()
  @IsObject()
  metaDescription?: { [langCode: string]: string };

  @IsOptional()
  @IsString()
  customSlug?: string;

  @IsOptional()
  @IsString()
  schemaMarkup?: string;

  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  robotsFollow?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "ID should not be empty." })
  id?: string;

  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;

  @IsOptional()
  __v?: number | string; // MongoDB version key - can be number or string
}

export class FindAllQueryDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  updatedAt: string;

  @IsOptional()
  @IsString()
  sort: string = "createdAt";

  @IsOptional()
  @IsString()
  direction: "asc" | "desc" = "desc";

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}
