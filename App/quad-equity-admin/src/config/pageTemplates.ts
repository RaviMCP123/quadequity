import { STATIC_PAGE_TEMPLATES } from "./staticPageTemplates";

export interface TemplateField {
  key: string;
  type: "text" | "richText" | "image" | "imageArray" | "pdf" | "link";
  label: string;
  required?: boolean;
  multilingual?: boolean; // Default: true
  placeholder?: string;
  helpText?: string;
}

export interface PageTemplate {
  key: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  sampleContent?: Record<string, any>; // Sample/dummy content for this template
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    key: "PAGE_TEMPLATE_V1",
    name: "Page Template",
    description: "Dynamic template for creating pages with customizable sections (title, subtitle, description, images). Add as many sections as needed.",
    fields: [], // Dynamic template - sections are added by admin
    sampleContent: {
      // Sample banner data for demonstration
      bannerTitle: { en: "Welcome to Our Platform" },
      bannerDescription: { 
        en: "<p>This is a sample banner description. You can customize this content to create an engaging introduction for your page. The banner appears at the top of your page and helps set the tone for your content.</p>" 
      },
      // Sample page sections for demonstration
      pageSections: [
        {
          title: { en: "Banner Section" },
          subtitle: { en: "Welcome to Our Platform" },
          description: { 
            en: "<p>This is a sample banner section with a title, subtitle, and description. You can customize this content and add images to make it more engaging.</p>" 
          },
          images: ["/assets/img/termly/designed_for_simplicity.png"],
        },
        {
          title: { en: "Overview Section" },
          subtitle: { en: "What We Offer" },
          description: { 
            en: "<p>This section provides an overview of our services and features. You can add multiple images here (up to 3) to showcase your offerings.</p><p>Each section can have its own title, subtitle, description, and images.</p>" 
          },
          images: ["/assets/img/termly/structured_payment_support_platform.png"],
        },
        {
          title: { en: "Features Section" },
          description: { 
            en: "<p>Highlight your key features and benefits in this section. The subtitle is optional, so you can skip it if you don't need it.</p><p>You can add up to 3 images per section to make your content more visual and engaging.</p>" 
          },
          images: ["/assets/img/termly/built_around_your_operations.png"],
        },
      ],
    },
  },
  {
    key: "INNER_PAGE_V1",
    name: "Inner Page Template",
    description:
      "Termly-style inner page layout: top-left image, top-right image, bottom-left text, and bottom-right image.",
    fields: [
      {
        key: "topLeftImage",
        type: "image",
        label: "Top Left Image",
        required: true,
      },
      {
        key: "topRightImage",
        type: "image",
        label: "Top Right Image",
        required: true,
      },
      {
        key: "bottomLeftText",
        type: "richText",
        label: "Bottom Left Text",
        required: true,
        placeholder: "Add the inner page text content...",
      },
      {
        key: "bottomRightImage",
        type: "image",
        label: "Bottom Right Image",
        required: true,
      },
    ],
    sampleContent: {
      bottomLeftText: {
        en: "<h4>These days, you can do just about anything online—even visit your doctor. So why do you still need to drive across town just to get someone to notarize a document?</h4><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In natus accusamus id dicta saepe quae illo, fugit perferendis ipsa tempora magni eius debitis asperiores, iste qui, commodi sed?</p>",
      },
    },
  },
  {
    key: "HOMEPAGE_V1",
    name: "Home Page",
    description: "Template for the main homepage with banner, sections, and call-to-action",
    fields: [
      // Banner Section
      {
        key: "bannerTitle",
        type: "text",
        label: "Banner Title",
        required: true,
        placeholder: "Flexible School Fee Support. Structured for Certainty.",
      },
      {
        key: "bannerDescription",
        type: "richText",
        label: "Banner Description",
        required: true,
        placeholder: "Termly provides schools with a clear and structured way...",
      },
      {
        key: "bannerButton1Text",
        type: "text",
        label: "Banner Button 1 Text",
        placeholder: "For Schools",
      },
      {
        key: "bannerButton1Link",
        type: "link",
        label: "Banner Button 1 Link",
        placeholder: "enquire",
      },
      {
        key: "bannerButton2Text",
        type: "text",
        label: "Banner Button 2 Text",
        placeholder: "For Parents",
      },
      {
        key: "bannerButton2Link",
        type: "link",
        label: "Banner Button 2 Link",
        placeholder: "contact",
      },
      {
        key: "bannerImage",
        type: "image",
        label: "Banner Image/Shape",
        placeholder: "shape.svg",
      },
      
      // Section 1 - The Need
      {
        key: "section1Title",
        type: "text",
        label: "Section 1 Title",
        required: true,
        placeholder: "Balancing Flexibility with Stability",
      },
      {
        key: "section1Description",
        type: "richText",
        label: "Section 1 Description",
        required: true,
        placeholder: "Schools increasingly require solutions...",
      },
      {
        key: "section1Image",
        type: "image",
        label: "Section 1 Image",
        placeholder: "balancing_flexibility_with_stability.png",
      },
      
      // Section 2 - What Termly Is
      {
        key: "section2Title",
        type: "text",
        label: "Section 2 Title",
        required: true,
        placeholder: "A Structured Payment Support Platform",
      },
      {
        key: "section2Description",
        type: "richText",
        label: "Section 2 Description",
        required: true,
        placeholder: "Termly enables schools to offer structured...",
      },
      {
        key: "section2Image",
        type: "image",
        label: "Section 2 Image",
        placeholder: "structured_payment_support_platform.png",
      },
      {
        key: "section2Feature1",
        type: "text",
        label: "Section 2 Feature 1",
        placeholder: "Simple onboarding",
      },
      {
        key: "section2Feature2",
        type: "text",
        label: "Section 2 Feature 2",
        placeholder: "Clear communication framework",
      },
      {
        key: "section2Feature3",
        type: "text",
        label: "Section 2 Feature 3",
        placeholder: "Structured term-based plans",
      },
      {
        key: "section2Feature4",
        type: "text",
        label: "Section 2 Feature 4",
        placeholder: "Ongoing support throughout each cycle",
      },
      
      // Section 3 - How It Works (Homepage Version)
      {
        key: "section3Title",
        type: "text",
        label: "Section 3 Title",
        required: true,
        placeholder: "A Clear and Measured Process",
      },
      {
        key: "section3Step1",
        type: "text",
        label: "Section 3 Step 1",
        placeholder: "School Registration",
      },
      {
        key: "section3Step1Description",
        type: "richText",
        label: "Section 3 Step 1 Description",
        placeholder: "Schools complete a short registration form...",
      },
      {
        key: "section3Step2",
        type: "text",
        label: "Section 3 Step 2",
        placeholder: "Review & Structuring",
      },
      {
        key: "section3Step2Description",
        type: "richText",
        label: "Section 3 Step 2 Description",
        placeholder: "We assess suitability and align...",
      },
      {
        key: "section3Step3",
        type: "text",
        label: "Section 3 Step 3",
        placeholder: "Implementation",
      },
      {
        key: "section3Step3Description",
        type: "richText",
        label: "Section 3 Step 3 Description",
        placeholder: "Families are onboarded through...",
      },
      {
        key: "section3Step4",
        type: "text",
        label: "Section 3 Step 4",
        placeholder: "Ongoing Support",
      },
      {
        key: "section3Step4Description",
        type: "richText",
        label: "Section 3 Step 4 Description",
        placeholder: "Our team provides assistance...",
      },
      {
        key: "section3Image",
        type: "image",
        label: "Section 3 Image",
        placeholder: "structured_payment_support_platform.png",
      },
      
      // Section 4 - Designed for Schools
      {
        key: "section4Title",
        type: "text",
        label: "Section 4 Title",
        required: true,
        placeholder: "Built Around Your Operations",
      },
      {
        key: "section4Description",
        type: "richText",
        label: "Section 4 Description",
        required: true,
        placeholder: "Termly integrates alongside existing school processes...",
      },
      {
        key: "section4Image",
        type: "image",
        label: "Section 4 Image",
        placeholder: "built_around_your_operations.png",
      },
      {
        key: "section4Feature1",
        type: "text",
        label: "Section 4 Feature 1",
        placeholder: "Aligned to school fee calendars",
      },
      {
        key: "section4Feature2",
        type: "text",
        label: "Section 4 Feature 2",
        placeholder: "Transparent structure",
      },
      {
        key: "section4Feature3",
        type: "text",
        label: "Section 4 Feature 3",
        placeholder: "Professional communication materials",
      },
      {
        key: "section4Feature4",
        type: "text",
        label: "Section 4 Feature 4",
        placeholder: "Dedicated support during onboarding",
      },
      
      // Section 5 - Positioning
      {
        key: "section5Title",
        type: "text",
        label: "Section 5 Title",
        required: true,
        placeholder: "Professional Structured Discreet",
      },
      {
        key: "section5Description",
        type: "richText",
        label: "Section 5 Description",
        required: true,
        placeholder: "Termly works collaboratively with schools...",
      },
      {
        key: "section5Image",
        type: "image",
        label: "Section 5 Image",
        placeholder: "professional_structured_discreet.png",
      },
      
      // Final CTA Section
      {
        key: "ctaTitle",
        type: "text",
        label: "CTA Section Title",
        required: true,
        placeholder: "Explore a Structured Approach to Fee Flexibility.",
      },
      {
        key: "ctaButton1Text",
        type: "text",
        label: "CTA Button 1 Text",
        placeholder: "Register Your School",
      },
      {
        key: "ctaButton2Text",
        type: "text",
        label: "CTA Button 2 Text",
        placeholder: "Contact Our Team",
      },
      {
        key: "ctaImage",
        type: "image",
        label: "CTA Section Image",
        placeholder: "built_around_your_operations.png",
      },
      
      // Termly Difference Section
      {
        key: "differenceTitle",
        type: "text",
        label: "Difference Section Title",
        required: true,
        placeholder: "Discover the Termly difference",
      },
      {
        key: "differenceDescription",
        type: "text",
        label: "Difference Section Description",
        placeholder: "Offer families flexibility and Improve payment confidence.",
      },
      {
        key: "differenceCard1Title",
        type: "text",
        label: "Difference Card 1 Title",
        placeholder: "Flexible Payments for Families",
      },
      {
        key: "differenceCard1Description",
        type: "text",
        label: "Difference Card 1 Description",
        placeholder: "Termly allows families to split school fees...",
      },
      {
        key: "differenceCard1Image",
        type: "image",
        label: "Difference Card 1 Image",
        placeholder: "school.webp",
      },
      {
        key: "differenceCard2Title",
        type: "text",
        label: "Difference Card 2 Title",
        placeholder: "Stable Cash Flow for Schools",
      },
      {
        key: "differenceCard2Description",
        type: "text",
        label: "Difference Card 2 Description",
        placeholder: "Schools receive payments smoothly...",
      },
      {
        key: "differenceCard2Image",
        type: "image",
        label: "Difference Card 2 Image",
        placeholder: "family.webp",
      },
    ],
    sampleContent: {
      bannerTitle: { en: "Flexible School Fee Support. Structured for Certainty." },
      bannerDescription: { 
        en: "<p>Termly provides schools with a clear and structured way to offer families term-based fee flexibility — without increasing administrative burden.</p>" 
      },
      bannerButton1Text: { en: "For Schools" },
      bannerButton1Link: { en: "enquire" },
      bannerButton2Text: { en: "For Parents" },
      bannerButton2Link: { en: "contact" },
      section1Title: { en: "Balancing Flexibility with Stability" },
      section1Description: { 
        en: "<p>Schools increasingly require solutions that support families while maintaining predictable fee collection and operational clarity.</p><p>Termly is designed to help schools provide structured payment flexibility without disrupting core systems or processes.</p>" 
      },
      section2Title: { en: "A Structured Payment Support Platform" },
      section2Description: { 
        en: "<p>Termly enables schools to offer structured, term-based fee support through a secure and streamlined process.</p><p>The platform is designed around existing school fee calendars and administrative workflows.</p>" 
      },
      section2Feature1: { en: "Simple onboarding" },
      section2Feature2: { en: "Clear communication framework" },
      section2Feature3: { en: "Structured term-based plans" },
      section2Feature4: { en: "Ongoing support throughout each cycle" },
      section3Title: { en: "A Clear and Measured Process" },
      section3Step1: { en: "School Registration" },
      section3Step1Description: { 
        en: "<p>Schools complete a short registration form to begin the process.</p>" 
      },
      section3Step2: { en: "Review & Structuring" },
      section3Step2Description: { 
        en: "<p>We assess suitability and align a term-based structure to your existing fee schedule.</p>" 
      },
      section3Step3: { en: "Implementation" },
      section3Step3Description: { 
        en: "<p>Families are onboarded through a secure and structured digital process.</p>" 
      },
      section3Step4: { en: "Ongoing Support" },
      section3Step4Description: { 
        en: "<p>Our team provides assistance and oversight throughout the term.</p>" 
      },
      section4Title: { en: "Built Around Your Operations" },
      section4Description: { 
        en: "<p>Termly integrates alongside existing school processes.</p><p>It is designed to reduce friction, support engagement and provide structured clarity — without adding unnecessary administrative complexity.</p>" 
      },
      section4Feature1: { en: "Aligned to school fee calendars" },
      section4Feature2: { en: "Transparent structure" },
      section4Feature3: { en: "Professional communication materials" },
      section4Feature4: { en: "Dedicated support during onboarding" },
      section5Title: { en: "Professional Structured Discreet" },
      section5Description: { 
        en: "<p>Termly works collaboratively with schools to introduce measured fee flexibility within a controlled and transparent framework.</p><p>Our focus is long-term alignment and operational clarity.</p>" 
      },
      ctaTitle: { en: "Explore a Structured Approach to Fee Flexibility." },
      ctaButton1Text: { en: "Register Your School" },
      ctaButton2Text: { en: "Contact Our Team" },
      differenceTitle: { en: "Discover the Termly difference" },
      differenceDescription: { en: "Offer families flexibility and Improve payment confidence." },
      differenceCard1Title: { en: "Flexible Payments for Families" },
      differenceCard1Description: { en: "Termly allows families to split school fees into manageable instalment" },
      differenceCard2Title: { en: "Stable Cash Flow for Schools" },
      differenceCard2Description: { en: "Schools receive payments smoothly while offering families greater flexibility." },
      // Sample images for homepage template
      bannerImage: "/assets/img/new/shape.svg",
      section1Image: "/assets/img/termly/balancing_flexibility_with_stability.png",
      section2Image: "/assets/img/termly/structured_payment_support_platform.png",
      section3Image: "/assets/img/termly/structured_payment_support_platform.png",
      section4Image: "/assets/img/termly/built_around_your_operations.png",
      section5Image: "/assets/img/new/professional_structured_discreet.png",
      ctaImage: "/assets/img/termly/built_around_your_operations.png",
      differenceCard1Image: "/assets/img/new/school.webp",
      differenceCard2Image: "/assets/img/new/family.webp",
    },
  },
];

// Additional templates that don't use SimpleTemplateEditor but should appear in dropdown
// These are handled by custom form logic (Contact Us, FAQ, Terms & Conditions)
export const ADDITIONAL_TEMPLATES: Array<{ value: string; label: string }> = [
  {
    value: "contact-us",
    label: "Contact Us",
  },
  {
    value: "faq",
    label: "FAQ",
  },
  {
    value: "terms-condition",
    label: "Terms & Conditions",
  },
  {
    value: "footer-template",
    label: "Footer Template",
  },
  {
    value: "privacy-policy",
    label: "Privacy Policy",
  },
  {
    value: "register-school",
    label: "Register Your School",
  },
];

// Helper: built-in static template keys (PAGE_TEMPLATE_V1) may be stored as
// `page_template` or `portfolio_template` in the DB; map to the shared definition.
const PAGE_TEMPLATE_BUILT_IN_KEY = "PAGE_TEMPLATE_V1";
const INNER_PAGE_TEMPLATE_BUILT_IN_KEY = "INNER_PAGE_V1";

// Helper function to get template by key
export const getTemplateByKey = (key: string): PageTemplate | undefined => {
  if (key === "page_template" || key === "portfolio_template" || key === PAGE_TEMPLATE_BUILT_IN_KEY) {
    return PAGE_TEMPLATES.find((t) => t.key === PAGE_TEMPLATE_BUILT_IN_KEY);
  }
  if (key === "innerpage_template" || key === INNER_PAGE_TEMPLATE_BUILT_IN_KEY) {
    return PAGE_TEMPLATES.find((t) => t.key === INNER_PAGE_TEMPLATE_BUILT_IN_KEY);
  }
  return PAGE_TEMPLATES.find((t) => t.key === key);
};

// Helper function to get all template keys and names
export const getTemplateOptions = (): Array<{ value: string; label: string }> => {
  // Combine PAGE_TEMPLATES with additional templates
  const templateOptions = PAGE_TEMPLATES.map((t) => ({
    value: t.key,
    label: t.name,
  }));
  
  // Add additional templates
  return [...templateOptions, ...ADDITIONAL_TEMPLATES];
};

/**
 * Only the four static page templates: Page, Contact Us, Portfolio, Footer.
 */
export function getStaticPageTemplateOptions(): Array<{ value: string; label: string }> {
  return [...STATIC_PAGE_TEMPLATES];
}
