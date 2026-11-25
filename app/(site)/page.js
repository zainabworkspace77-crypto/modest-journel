import Link from 'next/link';
import Img from '@/components/Img';
import ArticleCard from '@/components/ArticleCard';
import Newsletter from '@/components/Newsletter';
import { getSettings, getCategories, getArticles, topCategories } from '@/lib/data';
import { catUrl } from '@/lib/utils';

export default async function Home() {
  const [s, cats, arts] = await Promise.all([getSettings(), getCategories(), getArticles()]);
  const featured = arts.filter((a) => a.featured).slice(0, 3);
  const feat = featured.length ? featured : arts.slice(0, 3);
  const latest = arts.slice(0, 6);
  const popular = [...arts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>{s.heroTitle}</h1>
            <p className="lede">{s.heroIntro}</p>
            <Link href={arts[0] ? '/search?q=' : '/about'} className="btn">Browse all articles</Link>
          </div>
          <Img img={s.heroImage ? { url: s.heroImage, alt: '' } : null} eager ratio="4/5" className="hero-img" sizes="(min-width:900px) 45vw, 100vw" />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="cats-h">
        <h2 id="cats-h" className="section-h">Explore categories</h2>
        <div className="cat-grid">{topCategories(cats).map((c) => (
          <Link key={c.id} href={catUrl(c)} className="cat-tile">
            <Img img={c.image ? { url: c.image, alt: '' } : null} ratio="3/4" /><span>{c.title}</span>
          </Link>))}</div>
      </section>

      {feat.length > 0 && <section className="section wrap" aria-labelledby="feat-h">
        <h2 id="feat-h" className="section-h">Featured articles</h2>
        <div className="grid3">{feat.map((a) => <ArticleCard key={a.id} a={a} cats={cats} />)}</div></section>}

      {latest.length > 0 && <section className="section wrap" aria-labelledby="lat-h">
        <h2 id="lat-h" className="section-h">Latest articles</h2>
        <div className="grid3">{latest.map((a) => <ArticleCard key={a.id} a={a} cats={cats} />)}</div></section>}

      {popular.length > 0 && <section className="section wrap" aria-labelledby="pop-h">
        <h2 id="pop-h" className="section-h">Popular articles</h2>
        <ol className="popular">{popular.map((a) => (
          <li key={a.id}><Link href={`/articles/${a.slug}`}>{a.title}</Link><span className="meta">{cats.find((c) => c.id === a.categoryId)?.title}</span></li>))}</ol></section>}

      {arts.length === 0 && <section className="wrap section"><p className="notice">No articles published yet. Sign in at /admin to write your first one.</p></section>}
      {s.newsletterEnabled && <Newsletter />}
    </>
  );
}
