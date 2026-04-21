import { apiFetch } from './client';
import { API_BASE_URL } from '../lib/env';

/**
 * @returns {Promise<{ statusCode: number; data: object | null; message?: string }>}
 */
export async function fetchPageBySlug(slug) {
  const base = API_BASE_URL;
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not set');
  }
  const path = `/page/detail/${encodeURIComponent(slug)}`;
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message ?? res.statusText ?? 'Request failed';
    throw new Error(msg);
  }
  return json;
}

/**
 * CMS categories for navigation (header / footer).
 * @param {{ placement?: string; status?: boolean }} [query]
 */
export async function fetchCmsCategories(query = {}) {
  const base = API_BASE_URL;
  if (!base) return { statusCode: 200, data: [] };
  const params = new URLSearchParams();
  if (query.placement) params.set('placement', query.placement);
  if (query.status !== undefined) params.set('status', String(query.status));
  const q = params.toString();
  const url = `/cms/category/list${q ? `?${q}` : ''}`;
  return apiFetch(url);
}
