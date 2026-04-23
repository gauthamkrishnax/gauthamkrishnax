/**
 * Canonical site origin for absolute URLs in SEO tags (Open Graph, Twitter, JSON-LD).
 * Override at build time with `VITE_SITE_ORIGIN=https://your.domain` in `.env`.
 */
const fromEnv = import.meta.env.VITE_SITE_ORIGIN;
export const SITE_ORIGIN: string =
  typeof fromEnv === 'string' && fromEnv.trim() !== '' ? fromEnv.replace(/\/$/, '') : 'https://gauthamkrishna.in';
