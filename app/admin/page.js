'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { fmtDate } from '@/lib/utils';

export default function Overview() {
  const [arts, setArts] = useState([]), [cats, setCats] = useState([]);
  useEffect(() => {
    getDocs(collection(db, 'articles')).then((s) => setArts(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, 'categories')).then((s) => setCats(s.docs.map((d) => d.data())));
  }, []);
  const n = (st) => arts.filter((a) => a.status === st).length;
  const recent = [...arts].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 6);
  return (<>
    <div className="row sp"><h1>Overview</h1><Link className="btn" href="/admin/articles/new">New article</Link></div>
    <div className="stats">
      {[['Total articles', arts.length], ['Published', n('published')], ['Drafts', n('draft')], ['Categories', cats.filter((c) => !c.parentId).length]].map(([t, v]) => <div className="stat" key={t}><b>{v}</b>{t}</div>)}
    </div>
    <div className="panel"><h2>Recent articles</h2>
      {!recent.length ? <p>No articles yet. Create your first one.</p> : <div style={{ overflowX: 'auto' }}><table className="tbl"><tbody>{recent.map((a) => (
        <tr key={a.id}><td><Link href={`/admin/articles/${a.id}`}>{a.title || 'Untitled'}</Link></td><td><span className={`badge ${a.status}`}>{a.status}</span></td><td>{fmtDate(a.updatedAt)}</td></tr>))}</tbody></table></div>}
    </div></>);
}
