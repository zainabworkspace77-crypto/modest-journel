export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const abs = (p = '') => (/^https?:/.test(p) ? p : SITE_URL + p);

export function slugify(s = '') {
  return s.toString().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}
export const uid = () => Math.random().toString(36).slice(2, 10);

export function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function articleText(a) {
  const parts = [a.excerpt, a.conclusion];
  (a.sections || []).forEach((s) => parts.push(s.heading, s.body, s.items, s.rows, s.text));
  (a.faqs || []).forEach((f) => parts.push(f.q, f.a));
  return parts.filter(Boolean).join(' ');
}
export const readingTime = (a) => Math.max(1, Math.round(articleText(a).split(/\s+/).length / 210));

export const catUrl = (c, parent) => (parent ? `/category/${parent.slug}/${c.slug}` : `/category/${c.slug}`);
export const articleUrl = (a) => `/articles/${a.slug}`;
export const tocId = (s) => 'sec-' + slugify(s).slice(0, 50);
export const PER_PAGE = 9;
export const paginate = (items, page) => {
  const total = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const p = Math.min(Math.max(parseInt(page) || 1, 1), total);
  return { items: items.slice((p - 1) * PER_PAGE, p * PER_PAGE), page: p, total };
};
