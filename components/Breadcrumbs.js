import Link from 'next/link';
import JsonLd from './JsonLd';
import { abs } from '@/lib/utils';

export default function Breadcrumbs({ items }) { // [{name, href}] last item has no href needed
  return (
    <>
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>{items.map((it, i) => (
          <li key={i}>{it.href && i < items.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}</li>
        ))}</ol>
      </nav>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.href ? { item: abs(it.href) } : {}) })) }} />
    </>
  );
}
