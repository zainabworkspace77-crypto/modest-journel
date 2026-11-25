import { getArticles, getCategories } from '@/lib/data';
import { abs, catUrl } from '@/lib/utils';
export const revalidate = 3600;
export default async function sitemap() {
  const [arts, cats] = await Promise.all([getArticles(), getCategories()]);
  const top = Object.fromEntries(cats.filter((c) => !c.parentId).map((c) => [c.id, c]));
  return [
    { url: abs('/'), changeFrequency: 'daily', priority: 1 },
    ...['about', 'contact', 'privacy', 'terms'].map((p) => ({ url: abs('/' + p), changeFrequency: 'yearly', priority: 0.3 })),
    ...cats.map((c) => ({ url: abs(catUrl(c, c.parentId ? top[c.parentId] : null)), changeFrequency: 'weekly', priority: 0.7 })),
    ...arts.map((a) => ({ url: abs(`/articles/${a.slug}`), lastModified: a.updatedAt || a.publishedAt, changeFrequency: 'monthly', priority: 0.8 })),
  ];
}
