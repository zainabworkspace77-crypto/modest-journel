import { notFound, permanentRedirect } from 'next/navigation';
import ArticleView from '@/components/ArticleView';
import ViewCounter from '@/components/ViewCounter';
import JsonLd from '@/components/JsonLd';
import { getArticles, getCategories, getSettings, getRedirect, related as rel } from '@/lib/data';
import { abs, SITE_URL } from '@/lib/utils';

async function find(slug) {
  const a = (await getArticles()).find((x) => x.slug === slug);
  if (a) return a;
  const to = await getRedirect(slug); // slug was changed in the past: 301 to the new URL
  if (to) permanentRedirect(`/articles/${to}`);
  notFound();
}
export async function generateMetadata({ params }) {
  const a = await find(params.slug);
  const url = a.canonicalUrl || `/articles/${a.slug}`;
  const desc = a.metaDescription || a.excerpt;
  return {
    title: { absolute: a.seoTitle || a.title }, description: desc, alternates: { canonical: url },
    openGraph: { type: 'article', title: a.seoTitle || a.title, description: desc, url, publishedTime: a.publishedAt, modifiedTime: a.updatedAt, images: a.featuredImage?.url ? [a.featuredImage.url] : undefined },
    twitter: { card: 'summary_large_image' },
  };
}
export default async function Page({ params }) {
  const a = await find(params.slug);
  const [cats, arts, s] = await Promise.all([getCategories(), getArticles(), getSettings()]);
  const cat = cats.find((c) => c.id === a.categoryId), sub = cats.find((c) => c.id === a.subcategoryId);
  return (
    <>
      <ArticleView article={a} cat={cat} sub={sub} cats={cats} related={rel(arts, a)} />
      <ViewCounter id={a.id} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.metaDescription || a.excerpt,
        mainEntityOfPage: abs(`/articles/${a.slug}`), datePublished: a.publishedAt, dateModified: a.updatedAt || a.publishedAt,
        ...(a.featuredImage?.url ? { image: [a.featuredImage.url] } : {}),
        author: a.authorName ? { '@type': 'Person', name: a.authorName, ...(a.authorUrl ? { url: a.authorUrl } : {}) } : { '@type': 'Organization', name: s.siteTitle },
        publisher: { '@type': 'Organization', name: s.siteTitle, url: SITE_URL, ...(s.logo ? { logo: { '@type': 'ImageObject', url: s.logo } } : {}) },
      }} />
      {(a.faqs || []).some((f) => f.q && f.a) && <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: a.faqs.filter((f) => f.q && f.a).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />}
    </>
  );
}
