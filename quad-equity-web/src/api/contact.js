import { apiFetch } from './client';

/**
 * Submit contact form payload to your backend.
 * Set `VITE_API_BASE_URL` in `.env` to POST JSON to `{base}/contact`.
 * Without it, submissions are logged to the console only (demo).
 *
 * @param {{ name: string; phone: string; email: string; message: string }} payload
 */
export async function submitContactForm(payload) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) {
    console.info('[contact] demo mode — set VITE_API_BASE_URL to enable API posts.', payload);
    return { ok: true, demo: true };
  }
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
