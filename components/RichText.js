import Link from 'next/link';

const safeHref = (h) => (/^(https?:\/\/|\/|mailto:)/i.test(h) ? h : '#');
// Supports [text](url) links and **bold** only. Output is React elements, so it is XSS-safe.
export function Inline({ text = '' }) {
  return text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g).map((p, i) => {
    const l = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (l) {
      const h = safeHref(l[2]);
      return h.startsWith('/') ? <Link key={i} href={h}>{l[1]}</Link> : <a key={i} href={h} rel="noopener noreferrer">{l[1]}</a>;
    }
    const b = p.match(/^\*\*([^*]+)\*\*$/);
    return b ? <strong key={i}>{b[1]}</strong> : p;
  });
}
// Blank line = new paragraph. "## " h2, "### " h3, lines starting "- " = list.
export function Body({ text = '' }) {
  return text.split(/\n{2,}/).filter((b) => b.trim()).map((b, i) => {
    const t = b.trim();
    if (t.startsWith('### ')) return <h3 key={i}><Inline text={t.slice(4)} /></h3>;
    if (t.startsWith('## ')) return <h2 key={i}><Inline text={t.slice(3)} /></h2>;
    const lines = t.split('\n');
    if (lines.every((l) => l.startsWith('- '))) return <ul key={i}>{lines.map((l, j) => <li key={j}><Inline text={l.slice(2)} /></li>)}</ul>;
    return <p key={i}><Inline text={t} /></p>;
  });
}
