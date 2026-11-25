'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { revalidateSite } from '@/lib/adminLib';

const PAGES = [['about', 'About'], ['privacy', 'Privacy Policy'], ['terms', 'Terms and Conditions']];
export default function Pages() {
  const [slug, setSlug] = useState('about'), [p, setP] = useState(null), [msg, setMsg] = useState('');
  useEffect(() => { setP(null); setMsg(''); getDoc(doc(db, 'pages', slug)).then((d) => setP(d.exists() ? d.data() : { title: PAGES.find((x) => x[0] === slug)[1], body: '', seoTitle: '', metaDescription: '' })); }, [slug]);
  async function save() { await setDoc(doc(db, 'pages', slug), { ...p, updatedAt: new Date().toISOString() }); await revalidateSite(); setMsg('Saved.'); }
  const f = (k) => (e) => setP({ ...p, [k]: e.target.value });
  return (<><h1>Pages</h1>
    <div className="row" style={{ marginBottom: '1rem' }}>{PAGES.map(([s, t]) => <button key={s} className={`btn ${s === slug ? '' : 'ghost'} sm`} onClick={() => setSlug(s)}>{t}</button>)}</div>
    {!p ? <p>Loading</p> : <div className="panel af">
      <div><label>Page title</label><input value={p.title} onChange={f('title')} /></div>
      <div><label>Content</label><textarea rows={16} value={p.body} onChange={f('body')} /><small>Blank line = new paragraph. "## Heading" for headings, lines starting "- " for lists, [text](url) for links.</small></div>
      <div><label>SEO title</label><input value={p.seoTitle || ''} onChange={f('seoTitle')} /></div>
      <div><label>Meta description</label><textarea rows={2} value={p.metaDescription || ''} onChange={f('metaDescription')} /></div>
      <div className="row"><button className="btn" onClick={save}>Save page</button><a className="btn ghost" href={'/' + slug} target="_blank" rel="noopener">View page</a>{msg && <span className="ok">{msg}</span>}</div></div>}
  </>);
}
