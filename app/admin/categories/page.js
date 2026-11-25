'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { slugify } from '@/lib/utils';
import { clean, revalidateSite } from '@/lib/adminLib';
import { UrlImageField } from '@/components/admin/ImageField';

const BLANK = { title: '', slug: '', description: '', parentId: '', image: '', seoTitle: '', metaDescription: '' };
export default function Categories() {
  const [cats, setCats] = useState([]), [e, setE] = useState(null), [err, setErr] = useState(''), [msg, setMsg] = useState('');
  const load = () => getDocs(collection(db, 'categories')).then((s) => setCats(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  useEffect(() => { load(); }, []);
  const tops = cats.filter((c) => !c.parentId);
  const group = (pid) => cats.filter((c) => (c.parentId || '') === (pid || ''));

  async function save() {
    setErr(''); setMsg('');
    const title = e.title.trim(); if (!title) return setErr('Please enter a title.');
    const slug = slugify(e.slug || title);
    if (cats.some((c) => c.id !== e.id && c.slug === slug && (c.parentId || '') === (e.parentId || ''))) return setErr('That slug is already used at this level.');
    if (e.id && e.parentId === e.id) return setErr('A category cannot be its own parent.');
    if (e.parentId && cats.find((c) => c.id === e.parentId)?.parentId) return setErr('Subcategories can only go one level deep.');
    if (e.id && !e.parentId && cats.some((c) => c.parentId === e.id) === false) {} 
    const prev = cats.find((c) => c.id === e.id);
    if (prev && !prev.parentId && e.parentId && cats.some((c) => c.parentId === e.id)) return setErr('This category has subcategories. Move or delete them first.');
    const ref = e.id ? doc(db, 'categories', e.id) : doc(collection(db, 'categories'));
    const order = e.id && (prev.parentId || '') === (e.parentId || '') ? prev.order : group(e.parentId).length;
    const { id, ...rest } = e;
    await setDoc(ref, clean({ ...rest, title, slug, order, updatedAt: new Date().toISOString(), createdAt: rest.createdAt || new Date().toISOString() }));
    if (prev && prev.parentId !== e.parentId && e.parentId) { // moved: keep its articles under the new parent
      const arts = await getDocs(query(collection(db, 'articles'), where('subcategoryId', '==', e.id)));
      const b = writeBatch(db); arts.docs.forEach((d) => b.update(d.ref, { categoryId: e.parentId })); await b.commit();
    }
    await revalidateSite(); setE(null); setMsg('Saved.'); load();
  }
  async function del(c) {
    setErr(''); setMsg('');
    if (cats.some((x) => x.parentId === c.id)) return setErr('Delete or move its subcategories first.');
    const used = await getDocs(query(collection(db, 'articles'), where(c.parentId ? 'subcategoryId' : 'categoryId', '==', c.id)));
    if (!used.empty) return setErr(`${used.size} article(s) use this category. Reassign them first.`);
    if (!confirm(`Delete "${c.title}"?`)) return;
    await deleteDoc(doc(db, 'categories', c.id)); await revalidateSite(); load();
  }
  async function shift(c, d) {
    const g = group(c.parentId); const i = g.findIndex((x) => x.id === c.id), j = i + d; if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]]; const b = writeBatch(db); g.forEach((x, k) => b.update(doc(db, 'categories', x.id), { order: k })); await b.commit(); await revalidateSite(); load();
  }
  const Row = ({ c, sub }) => (<tr><td style={{ paddingLeft: sub ? '2rem' : undefined }}>{sub ? '– ' : ''}<strong>{c.title}</strong><br /><small>/{c.slug}</small></td>
    <td><div className="row"><button className="btn ghost sm" onClick={() => shift(c, -1)} aria-label="Move up">Up</button><button className="btn ghost sm" onClick={() => shift(c, 1)} aria-label="Move down">Down</button>
      <button className="btn ghost sm" onClick={() => { setE({ ...BLANK, ...c }); setErr(''); }}>Edit</button><button className="btn danger sm" onClick={() => del(c)}>Delete</button></div></td></tr>);
  return (<>
    <div className="row sp"><h1>Categories</h1><div className="row"><button className="btn" onClick={() => setE({ ...BLANK })}>New category</button><button className="btn ghost" onClick={() => setE({ ...BLANK, parentId: tops[0]?.id || '' })} disabled={!tops.length}>New subcategory</button></div></div>
    <div aria-live="polite">{err && <p className="err" role="alert">{err}</p>}{msg && <p className="ok">{msg}</p>}</div>
    {e && <div className="panel af"><h2>{e.id ? 'Edit' : 'New'} {e.parentId ? 'subcategory' : 'category'}</h2>
      <div className="two"><div><label>Title</label><input value={e.title} onChange={(x) => setE({ ...e, title: x.target.value, slug: e.id ? e.slug : slugify(x.target.value) })} /></div>
        <div><label>Slug</label><input value={e.slug} onChange={(x) => setE({ ...e, slug: slugify(x.target.value) })} /></div></div>
      <div><label>Parent category</label><select value={e.parentId} onChange={(x) => setE({ ...e, parentId: x.target.value })}><option value="">None (top-level category)</option>{tops.filter((t) => t.id !== e.id).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select><small>Change this to move a subcategory to another category.</small></div>
      <div><label>Description</label><textarea rows={3} value={e.description} onChange={(x) => setE({ ...e, description: x.target.value })} /></div>
      <UrlImageField label="Banner / tile image" value={e.image} onChange={(v) => setE({ ...e, image: v })} />
      <div><label>SEO title</label><input value={e.seoTitle} onChange={(x) => setE({ ...e, seoTitle: x.target.value })} /></div>
      <div><label>Meta description</label><textarea rows={2} value={e.metaDescription} onChange={(x) => setE({ ...e, metaDescription: x.target.value })} /></div>
      <div className="row"><button className="btn" onClick={save}>Save category</button><button className="btn ghost" onClick={() => setE(null)}>Cancel</button></div>
      {e.id && <small>Changing a slug changes the public URL of this category.</small>}</div>}
    <div style={{ overflowX: 'auto' }}><table className="tbl"><tbody>
      {!tops.length && <tr><td>No categories yet.</td></tr>}
      {tops.map((c) => [<Row key={c.id} c={c} />, ...group(c.id).map((s) => <Row key={s.id} c={s} sub />)])}</tbody></table></div>
  </>);
}
