import { unstable_cache } from 'next/cache';
import { db } from './firebaseAdmin';

export const DEFAULT_SETTINGS = {
  siteTitle: 'The Modest Edit', description: 'Modest fashion and hijab styling, written with care.',
  tagline: 'Modest style, considered.', logo: '', favicon: '', defaultOgImage: '',
  heroImage: '', heroTitle: 'Dressing with quiet confidence', heroIntro: 'Colour pairings, layering ideas and hijab styling guides for every day.',
  footerText: '', contactEmail: '', social: {}, newsletterEnabled: true, gaId: '', gscVerification: '',
};
const REV = 60;
const list = async (col) => (await db.collection(col).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
const cached = (fn, key, tag) => unstable_cache(fn, [key], { revalidate: REV, tags: [tag, 'site'] });

export const getSettings = cached(async () => {
  const d = await db.doc('settings/site').get();
  return { ...DEFAULT_SETTINGS, ...(d.data() || {}) };
}, 'settings', 'settings');

export const getCategories = cached(async () =>
  (await list('categories')).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), 'categories', 'categories');

export const getArticles = cached(async () => {
  const now = Date.now();
  return (await list('articles'))
    .filter((a) => a.status === 'published' && (!a.publishedAt || new Date(a.publishedAt).getTime() <= now))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}, 'articles', 'articles');

export const getPage = (slug) => unstable_cache(async () => {
  const d = await db.doc(`pages/${slug}`).get();
  return d.exists ? { id: d.id, ...d.data() } : null;
}, ['page-' + slug], { revalidate: REV, tags: ['pages', 'site'] })();

export async function getRedirect(slug) {
  const d = await db.doc(`redirects/${slug}`).get();
  return d.exists ? d.data().to : null;
}

export function topCategories(cats) { return cats.filter((c) => !c.parentId); }
export function subsOf(cats, id) { return cats.filter((c) => c.parentId === id); }
export function related(articles, a, n = 3) {
  const score = (x) => (x.subcategoryId && x.subcategoryId === a.subcategoryId ? 2 : 0) + (x.categoryId === a.categoryId ? 1 : 0)
    + ((x.tags || []).filter((t) => (a.tags || []).includes(t)).length * 0.5);
  return articles.filter((x) => x.id !== a.id).map((x) => [score(x), x]).filter(([s]) => s > 0)
    .sort((p, q) => q[0] - p[0]).slice(0, n).map(([, x]) => x);
}
