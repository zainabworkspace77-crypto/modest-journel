import { abs } from '@/lib/utils';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }], sitemap: abs('/sitemap.xml') };
}
