'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { revalidateSite } from '@/lib/adminLib';
import { fmtDate } from '@/lib/utils';

export default function Articles() {
  const [arts, setArts] = useState(null), [cats, setCats] = useState([]);
  const [q, setQ] = useState(''), [st, setSt] = useState(''), [cat, setCat] = useState('');
  const load = () => getDocs(collection(db, 'articles')).then((s) => setArts(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))));
  useEffect(() => { load(); getDocs(collection(db, 'categories')).then((s) => setCats(s.docs.map((d) => ({ id: d.id, ...d.data() })))); }, []);
  async function setStatus(a, status) {
    await updateDoc(doc(db, 'articles', a.id), { status, ...(status === 'published' && !a.publishedAt ? { publishedAt: new Date().toISOString() } : {}), updatedAt: new Date().toISOString() });
    await revalidateSite(); load();
  }
  async function del(a) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'articles', a.id)); await revalidateSite(); load();
  }
  const list = (arts || []).filter((a) => (!st || a.status === st) && (!cat || a.categoryId === cat) && (!q || (a.title + ' ' + a.slug).toLowerCase().includes(q.toLowerCase())));
  return (<>
    <div className="row sp"><h1>Articles</h1><Link className="btn" href="/admin/articles/new">New article</Link></div>
    <div className="panel row">
      <input style={{ flex: 1, minWidth: 180, padding: '.55rem', border: '1px solid var(--taupe)' }} placeholder="Search title or slug" aria-label="Search articles" value={q} onChange={(e) => setQ(e.target.value)} />
      <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value)} style={{ padding: '.55rem' }}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></select>
      <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} style={{ padding: '.55rem' }}><option value="">All categories</option>{cats.filter((c) => !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
    </div>
    <div style={{ overflowX: 'auto' }}><table className="tbl">
      <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Updated</th><th>Actions</th></tr></thead>
      <tbody>{!arts ? <tr><td colSpan="5">Loading</td></tr> : !list.length ? <tr><td colSpan="5">No articles match.</td></tr> : list.map((a) => (
        <tr key={a.id}><td><Link href={`/admin/articles/${a.id}`}><strong>{a.title || 'Untitled'}</strong></Link><br /><small>/articles/{a.slug}</small></td>
          <td><span className={`badge ${a.status}`}>{a.status}</span></td><td>{cats.find((c) => c.id === a.categoryId)?.title}</td><td>{fmtDate(a.updatedAt)}</td>
          <td><div className="row">
            <Link className="btn ghost sm" href={`/admin/articles/${a.id}`}>Edit</Link>
            {a.status === 'published' ? <><a className="btn ghost sm" href={`/articles/${a.slug}`} target="_blank" rel="noopener">View</a><button className="btn ghost sm" onClick={() => setStatus(a, 'unpublished')}>Unpublish</button></>
              : <button className="btn ghost sm" onClick={() => setStatus(a, 'published')}>Publish</button>}
            <button className="btn danger sm" onClick={() => del(a)}>Delete</button></div></td></tr>))}</tbody></table></div>
  </>);
}
