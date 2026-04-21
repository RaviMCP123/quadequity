import type { Language } from "interface/common";

/** Locales available in page/FAQ/contact editors when Language REST API is not used. */
export const ADMIN_LANGUAGE_LIST: Language[] = [
  { code: "en", title: "English" },
];

export const PAGE_LIMIT = 10;
export const PAGE_SIZE = ["10", "50", "100", "200", "500"];
export const LANGUAGE = "en";
export const STATUS_FILTER = [
  { text: "Active", value: true },
  { text: "Inactive", value: false },
];