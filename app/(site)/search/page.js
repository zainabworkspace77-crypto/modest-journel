import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { getArticles, getCategories } from '@/lib/data';
import { paginate, articleText } from '@/lib/utils';

export const metadata = { title: { absolute: 'Search' }, robots: { index: false, follow: true } };
export default async function Page({ searchParams }) {
  const q = String(searchParams.q || '').trim().slice(0, 100);
  const [arts, cats] = await Promise.all([getArticles(), getCategories()]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = terms.length ? arts.filter((a) => {
    const hay = `${a.title} ${(a.tags || []).join(' ')} ${articleText(a)}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  }) : arts;
  const pg = paginate(hits, searchParams.page);
  return (
    <div className="wrap">
      <header className="cat-head"><h1>{q ? `Results for “${q}”` : 'All articles'}</h1>
        <form action="/search" role="search" className="inline-form big"><label htmlFor="sq" className="sr">Search</label>
          <input id="sq" name="q" type="search" defaultValue={q} placeholder="Search articles" /><button className="btn">Search</button></form>
        <p className="meta">{hits.length} {hits.length === 1 ? 'article' : 'articles'}</p></header>
      {pg.items.length ? <div className="grid3">{pg.items.map((a) => <ArticleCard key={a.id} a={a} cats={cats} />)}</div>
        : <p className="notice">Nothing matched your search. Try a different word, or browse the categories.</p>}
      <Pagination base={`/search?q=${encodeURIComponent(q)}`} page={pg.page} total={pg.total} />
    </div>
  );
}
