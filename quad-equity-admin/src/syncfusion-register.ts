import { registerLicense } from "@syncfusion/ej2-base";

/** Must run before any `@syncfusion/*` component loads (import this file first from main.tsx). */
function normalizeLicenseKey(raw: string | undefined): string {
  if (!raw) return "";
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  return k;
}

const key = normalizeLicenseKey(import.meta.env.VITE_SYNCFUSION_LICENSE);
if (key) {
  registerLicense(key);
}
