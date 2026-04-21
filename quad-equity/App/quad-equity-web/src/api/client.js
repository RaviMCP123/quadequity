import { API_BASE_URL } from '../lib/env';

/**
 * @param {string} path - Path starting with /
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('application/json')) return res.json();
  return res.text();
}
