import Link from 'next/link';
import Img from './Img';
import { fmtDate, articleUrl } from '@/lib/utils';

export default function ArticleCard({ a, cats = [], big = false }) {
  const cat = cats.find((c) => c.id === a.categoryId);
  return (
    <article className={`card ${big ? 'big' : ''}`}>
      <Link href={articleUrl(a)} className="card-img" tabIndex={-1} aria-hidden="true"><Img img={a.featuredImage} ratio={big ? '4/3' : '4/5'} sizes={big ? '(min-width:900px) 50vw, 100vw' : undefined} /></Link>
      {cat && <p className="meta">{cat.title}</p>}
      <h3><Link href={articleUrl(a)}>{a.title}</Link></h3>
      <p className="excerpt">{a.excerpt}</p>
      <p className="meta"><time dateTime={a.publishedAt}>{fmtDate(a.publishedAt)}</time></p>
    </article>
  );
}
