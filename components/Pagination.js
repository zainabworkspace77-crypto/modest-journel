import Link from 'next/link';
export default function Pagination({ base, page, total }) {
  if (total <= 1) return null;
  const href = (p) => (p === 1 ? base : `${base}${base.includes('?') ? '&' : '?'}page=${p}`);
  return (
    <nav className="pager" aria-label="Pagination">
      {page > 1 && <Link href={href(page - 1)} rel="prev">Previous</Link>}
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={href(p)} aria-current={p === page ? 'page' : undefined} className={p === page ? 'on' : ''}>{p}</Link>
      ))}
      {page < total && <Link href={href(page + 1)} rel="next">Next</Link>}
    </nav>
  );
}
