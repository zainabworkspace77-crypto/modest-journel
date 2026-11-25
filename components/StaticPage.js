import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import { Body } from './RichText';
import Breadcrumbs from './Breadcrumbs';
import JsonLd from './JsonLd';
import { abs } from '@/lib/utils';

export async function pageMeta(slug) {
  const p = await getPage(slug); if (!p) return {};
  return { title: { absolute: p.seoTitle || p.title }, description: p.metaDescription || undefined, alternates: { canonical: '/' + slug } };
}
export default async function StaticPage({ slug }) {
  const p = await getPage(slug); if (!p) notFound();
  return (
    <div className="wrap narrow static">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: p.title }]} />
      <h1>{p.title}</h1>
      <div className="prose"><Body text={p.body} /></div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: p.title, url: abs('/' + slug) }} />
    </div>
  );
}
