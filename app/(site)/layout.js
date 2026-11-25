import Link from 'next/link';
import { getSettings, getCategories, topCategories } from '@/lib/data';
import { catUrl } from '@/lib/utils';

export default async function SiteLayout({ children }) {
  const [s, cats] = await Promise.all([getSettings(), getCategories()]);
  const nav = topCategories(cats).slice(0, 5);
  const links = [...nav.map((c) => [c.title, catUrl(c)]), ['About', '/about'], ['Contact', '/contact']];
  const social = Object.entries(s.social || {}).filter(([, v]) => v);
  return (
    <>
      <header className="site-header">
        <div className="wrap bar">
          <Link href="/" className="logo">{s.logo ? <img src={s.logo} alt={s.siteTitle} height="36" /> : s.siteTitle}</Link>
          <nav aria-label="Primary" className="nav-desktop">{links.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}</nav>
          <form action="/search" role="search" className="search-form">
            <label htmlFor="q" className="sr">Search articles</label>
            <input id="q" name="q" type="search" placeholder="Search" />
          </form>
          <details className="menu">
            <summary aria-label="Menu"><span /><span /></summary>
            <nav aria-label="Mobile">{links.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}</nav>
          </details>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap foot-grid">
          <div><p className="logo">{s.siteTitle}</p><p>{s.footerText || s.description}</p>{s.contactEmail && <p><a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></p>}</div>
          <nav aria-label="Footer"><p className="foot-h">Explore</p>{topCategories(cats).map((c) => <Link key={c.id} href={catUrl(c)}>{c.title}</Link>)}</nav>
          <nav aria-label="Legal"><p className="foot-h">Information</p>
            <Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms and Conditions</Link></nav>
          {social.length > 0 && <nav aria-label="Social"><p className="foot-h">Follow</p>{social.map(([k, v]) => <a key={k} href={v} rel="noopener noreferrer me" style={{ textTransform: 'capitalize' }}>{k}</a>)}</nav>}
        </div>
        <p className="wrap copy">© {new Date().getFullYear()} {s.siteTitle}</p>
      </footer>
    </>
  );
}
