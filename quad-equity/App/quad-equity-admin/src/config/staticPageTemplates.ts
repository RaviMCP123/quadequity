/**
 * Static page templates in the app (user-facing names / stored keys).
 * Stored in the database as `page.templateKey`.
 */
export const STATIC_PAGE_TEMPLATES = [
  { value: "page_template", label: "Page Template" },
  { value: "innerpage_template", label: "Inner Page Template" },
  { value: "contactus_template", label: "Contact Us" },
  { value: "portfolio_template", label: "Portfolio" },
  { value: "footer_template", label: "Footer" },
] as const;

export type StaticPageTemplateKey = (typeof STATIC_PAGE_TEMPLATES)[number]["value"];

/** For SimpleTemplateEditor / getTemplateByKey: map to the built-in page template config. */
export const PAGE_LIKE_CANONICAL_KEYS: StaticPageTemplateKey[] = [
  "page_template",
  "portfolio_template",
];

const LEGACY_TO_FOUR: Record<string, string> = {
  PAGE_TEMPLATE_V1: "page_template",
  INNER_PAGE_V1: "innerpage_template",
  HOMEPAGE_V1: "page_template",
  "contact-us": "contactus_template",
  "footer-template": "footer_template",
  faq: "page_template",
  "terms-condition": "page_template",
  "privacy-policy": "page_template",
  "register-school": "page_template",
};

/**
 * When loading the form, use one of the static keys.
 * Maps old templateKey values. If the page was PAGE_TEMPLATE with
 * `category === "portfolio"`, it becomes `portfolio_template`.
 */
export function canonicalizeStaticTemplateKey(
  key: string | undefined,
  category?: string,
): string {
  const c = (category || "").toLowerCase();
  const k = (key || "").trim();

  if (
    k === "page_template" ||
    k === "innerpage_template" ||
    k === "portfolio_template" ||
    k === "contactus_template" ||
    k === "footer_template"
  ) {
    if (k === "page_template" && c === "portfolio") return "portfolio_template";
    return k;
  }
  if (!k) {
    return c === "portfolio" ? "portfolio_template" : "page_template";
  }
  if (k === "PAGE_TEMPLATE_V1" && c === "portfolio") {
    return "portfolio_template";
  }
  if (k === "PAGE_TEMPLATE_V1") {
    return "page_template";
  }
  if (k === "contact-us") return "contactus_template";
  if (k === "footer-template") return "footer_template";
  if (LEGACY_TO_FOUR[k]) {
    const m = LEGACY_TO_FOUR[k];
    if (m === "page_template" && c === "portfolio") return "portfolio_template";
    return m;
  }
  return c === "portfolio" ? "portfolio_template" : "page_template";
}

/** Banners + page sections + quad: Page / Portfolio, or legacy PAGE_TEMPLATE_V1 */
export function isPageWithSectionsTemplate(key: string | undefined): boolean {
  if (!key) return false;
  if (key === "page_template" || key === "portfolio_template" || key === "PAGE_TEMPLATE_V1") {
    return true;
  }
  return false;
}

export function isContactContentTemplate(key: string | undefined): boolean {
  if (!key) return false;
  return key === "contactus_template" || key === "contact-us";
}

export function isFooterContentTemplate(key: string | undefined): boolean {
  if (!key) return false;
  return key === "footer_template" || key === "footer-template";
}

export function isInnerPageContentTemplate(key: string | undefined): boolean {
  if (!key) return false;
  return key === "innerpage_template" || key === "INNER_PAGE_V1";
}
