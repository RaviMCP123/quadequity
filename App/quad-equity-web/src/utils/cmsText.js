/** Default locale for CMS multilingual fields (admin uses en, etc.). */
export const CMS_LANG = import.meta.env.VITE_CMS_LANG ?? 'en';

/**
 * @param {unknown} value - string | { [lang]: string } | undefined
 * @param {string} [lang]
 * @returns {string}
 */
export function pickLang(value, lang = CMS_LANG) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const o = /** @type {Record<string, string>} */ (value);
    return o[lang] ?? o.en ?? Object.values(o).find((v) => typeof v === 'string' && v.trim()) ?? '';
  }
  return String(value);
}

/**
 * Resolves uploaded asset URLs from API (may be absolute or relative).
 * @param {string} [url]
 * @param {string} apiBase - VITE_API_BASE_URL (often ends with /api)
 */
export function resolveAssetUrl(url, apiBase) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (apiBase ?? '').replace(/\/$/, '');
  const origin = base.replace(/\/api$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${path}`;
}

/**
 * Removes inline `style` attributes from CMS HTML (CKEditor) so the site
 * `style.css` controls typography and colors, especially on the hero.
 * @param {string} [html]
 * @returns {string}
 */
export function stripCmsInlineStyles(html) {
  if (html == null || typeof html !== 'string') return html ?? '';
  return html
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/\sstyle='[^']*'/gi, '');
}
