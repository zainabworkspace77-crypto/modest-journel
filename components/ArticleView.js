import Link from 'next/link';
import Img from './Img';
import Breadcrumbs from './Breadcrumbs';
import ArticleCard from './ArticleCard';
import { Body, Inline } from './RichText';
import { fmtDate, readingTime, tocId, catUrl } from '@/lib/utils';

function Block({ s }) {
  const h = s.heading ? <h2 id={tocId(s.heading)}>{s.heading}</h2> : null;
  switch (s.type) {
    case 'list': {
      const L = s.ordered ? 'ol' : 'ul';
      return <section>{h}<L>{(s.items || '').split('\n').filter(Boolean).map((t, i) => <li key={i}><Inline text={t} /></li>)}</L></section>;
    }
    case 'table': {
      const rows = (s.rows || '').split('\n').filter(Boolean).map((r) => r.split('|').map((c) => c.trim()));
      if (!rows.length) return <section>{h}</section>;
      return <section>{h}<div className="table-wrap"><table>
        <thead><tr>{rows[0].map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div></section>;
    }
    case 'quote':
      return <blockquote><p><Inline text={s.text} /></p>{s.cite && <footer>{s.cite}</footer>}</blockquote>;
    case 'callout':
      return <aside className="callout">{s.heading && <p className="callout-h">{s.heading}</p>}<Body text={s.body} /></aside>;
    case 'gallery':
      return <section>{h}<div className="gallery">{(s.images || []).map((im, i) => (
        <figure key={i}><Img img={im} sizes="(min-width:700px) 33vw, 50vw" ratio="1/1" />{im.caption && <figcaption>{im.caption}</figcaption>}</figure>))}</div></section>;
    default:
      return <section>{h}<Body text={s.body} />{s.image?.url && <figure><Img img={s.image} sizes="(min-width:900px) 720px, 100vw" />{s.image.caption && <figcaption>{s.image.caption}</figcaption>}</figure>}</section>;
  }
}

export default function ArticleView({ article: a, cat, sub, related = [], cats = [] }) {
  const secs = a.sections || [];
  const faqs = (a.faqs || []).filter((f) => f.q && f.a);
  const toc = [...secs.filter((s) => s.heading && s.type !== 'callout').map((s) => [s.heading, tocId(s.heading)]),
    ...(a.conclusion ? [['Conclusion', 'conclusion']] : []), ...(faqs.length ? [['Frequently asked questions', 'faqs']] : [])];
  const crumbs = [{ name: 'Home', href: '/' }];
  if (cat) crumbs.push({ name: cat.title, href: catUrl(cat) });
  if (sub && cat) crumbs.push({ name: sub.title, href: catUrl(sub, cat) });
  crumbs.push({ name: a.title || 'Untitled' });
  return (
    <div className="wrap article-layout">
      <header className="article-head">
        <Breadcrumbs items={crumbs} />
        {cat && <p className="meta"><Link href={catUrl(cat)}>{cat.title}</Link></p>}
        <h1>{a.title || 'Untitled article'}</h1>
        {a.excerpt && <p className="lede">{a.excerpt}</p>}
        <p className="meta">
          {a.authorName && <>By {a.authorUrl ? <a href={a.authorUrl}>{a.authorName}</a> : a.authorName}. </>}
          <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt || new Date())}</time>. {readingTime(a)} min read.
        </p>
      </header>
      {a.featuredImage?.url && <figure className="hero-fig"><Img img={a.featuredImage} eager sizes="(min-width:1100px) 1000px, 100vw" />{a.featuredImage.caption && <figcaption>{a.featuredImage.caption}</figcaption>}</figure>}
      <div className="article-grid">
        {toc.length > 1 && (
          <nav className="toc" aria-label="Table of contents">
            <details open><summary>In this article</summary>
              <ol>{toc.map(([t, id]) => <li key={id}><a href={'#' + id}>{t}</a></li>)}</ol></details>
          </nav>
        )}
        <div className="prose">
          {secs.map((s) => <Block key={s.id || s.heading} s={s} />)}
          {a.conclusion && <section><h2 id="conclusion">Conclusion</h2><Body text={a.conclusion} /></section>}
          {faqs.length > 0 && <section><h2 id="faqs">Frequently asked questions</h2>
            {faqs.map((f, i) => <details key={i} className="faq"><summary>{f.q}</summary><div><Body text={f.a} /></div></details>)}</section>}
          {a.authorName && a.authorBio && <aside className="author"><p className="callout-h">About {a.authorName}</p><p>{a.authorBio}</p></aside>}
        </div>
      </div>
      {related.length > 0 && <section className="section" aria-labelledby="rel"><h2 id="rel" className="section-h">Related articles</h2>
        <div className="grid3">{related.map((r) => <ArticleCard key={r.id} a={r} cats={cats} />)}</div></section>}
    </div>
  );
}
