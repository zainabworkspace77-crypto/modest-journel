import Link from 'next/link';
import Img from './Img';
import ArticleCard from './ArticleCard';
import Breadcrumbs from './Breadcrumbs';
import Pagination from './Pagination';
import { catUrl, paginate } from '@/lib/utils';
import { subsOf } from '@/lib/data';

export default function CategoryView({ cat, parent, cats, articles, page }) {
  const subs = parent ? [] : subsOf(cats, cat.id);
  const base = catUrl(cat, parent);
  const pg = paginate(articles, page);
  const crumbs = [{ name: 'Home', href: '/' }, ...(parent ? [{ name: parent.title, href: catUrl(parent) }] : []), { name: cat.title, href: base }];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="cat-head">
        <h1>{cat.title}</h1>
        {cat.description && <p className="lede">{cat.description}</p>}
      </header>
      {cat.image && <figure className="hero-fig"><Img img={{ url: cat.image, alt: '' }} eager ratio="21/9" sizes="100vw" /></figure>}
      {subs.length > 0 && <nav aria-label="Subcategories" className="chips">{subs.map((s) => <Link key={s.id} href={catUrl(s, cat)}>{s.title}</Link>)}</nav>}
      {pg.items.length ? <div className="grid3">{pg.items.map((a) => <ArticleCard key={a.id} a={a} cats={cats} />)}</div> : <p className="notice">No articles here yet.</p>}
      <Pagination base={base} page={pg.page} total={pg.total} />
    </div>
  );
}
