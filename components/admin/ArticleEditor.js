'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { slugify, uid } from '@/lib/utils';
import { clean, revalidateSite } from '@/lib/adminLib';
import ImageField, { GalleryField } from './ImageField';
import ArticleView from '@/components/ArticleView';

const EMPTY = { title: '', slug: '', excerpt: '', featuredImage: null, categoryId: '', subcategoryId: '', status: 'draft', publishedAt: '', authorName: '', authorUrl: '', authorBio: '', seoTitle: '', metaDescription: '', canonicalUrl: '', tags: [], featured: false, sections: [], conclusion: '', faqs: [], views: 0 };
const NEW = {
  text: { type: 'text', heading: '', body: '', image: null }, list: { type: 'list', heading: '', items: '', ordered: false },
  table: { type: 'table', heading: '', rows: 'Column 1 | Column 2\nValue | Value' }, quote: { type: 'quote', text: '', cite: '' },
  callout: { type: 'callout', heading: '', body: '' }, gallery: { type: 'gallery', heading: '', images: [] },
};
const LABEL = { text: 'Text section', list: 'List', table: 'Table', quote: 'Quote', callout: 'Highlighted information', gallery: 'Image gallery' };
const toLocal = (iso) => (iso ? new Date(new Date(iso) - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

function SectionEditor({ s, set }) {
  const f = (k, label, area, hint) => (<div><label>{label}</label>
    {area ? <textarea rows={area} value={s[k] || ''} onChange={(e) => set({ ...s, [k]: e.target.value })} /> : <input value={s[k] || ''} onChange={(e) => set({ ...s, [k]: e.target.value })} />}
    {hint && <small>{hint}</small>}</div>);
  return (<div className="af">
    {s.type !== 'quote' && f('heading', s.type === 'callout' ? 'Title (optional)' : 'Section heading (H2)')}
    {s.type === 'text' && <>{f('body', 'Paragraph content', 8, 'Blank line = new paragraph. Links: [text](/articles/other-slug). Bold: **text**. Sub-heading: start a paragraph with ### .')}
      <ImageField label="Section image (optional)" value={s.image} onChange={(v) => set({ ...s, image: v })} /></>}
    {s.type === 'list' && <>{f('items', 'List items', 6, 'One item per line.')}<label><input type="checkbox" checked={!!s.ordered} onChange={(e) => set({ ...s, ordered: e.target.checked })} /> Numbered list</label></>}
    {s.type === 'table' && f('rows', 'Table rows', 6, 'One row per line, columns separated by |. First row is the header.')}
    {s.type === 'quote' && <>{f('text', 'Quote', 3)}{f('cite', 'Source (optional)')}</>}
    {s.type === 'callout' && f('body', 'Content', 4)}
    {s.type === 'gallery' && <GalleryField images={s.images} onChange={(images) => set({ ...s, images })} />}
  </div>);
}

export default function ArticleEditor({ id }) {
  const router = useRouter();
  const [a, setA] = useState(EMPTY), [cats, setCats] = useState([]), [orig, setOrig] = useState(null);
  const [slugTouched, setTouched] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState(''), [prev, setPrev] = useState(false), [addType, setAddType] = useState('text'), [busy, setBusy] = useState(false);
  useEffect(() => {
    getDocs(collection(db, 'categories')).then((s) => setCats(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((x, y) => (x.order ?? 0) - (y.order ?? 0))));
    if (id !== 'new') getDoc(doc(db, 'articles', id)).then((d) => { if (d.exists()) { const v = { ...EMPTY, ...d.data(), id: d.id }; setA(v); setOrig({ slug: v.slug, status: v.status }); setTouched(true); } else setErr('Article not found.'); });
  }, [id]);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const secs = a.sections || [];
  const setSec = (i, s) => set('sections', secs.map((x, j) => (j === i ? s : x)));
  const move = (i, d) => { const n = [...secs]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set('sections', n); };
  const faqs = a.faqs || [];
  const cat = cats.find((c) => c.id === a.categoryId), sub = cats.find((c) => c.id === a.subcategoryId);

  async function save(status) {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const title = a.title.trim(); if (!title) throw new Error('Please enter a title.');
      const slug = slugify(a.slug || title); if (!slug) throw new Error('Please enter a URL slug.');
      const dup = await getDocs(query(collection(db, 'articles'), where('slug', '==', slug)));
      if (dup.docs.some((d) => d.id !== id)) throw new Error('Another article already uses this URL slug. Please change it.');
      const st = status || a.status, now = new Date().toISOString();
      const ref = id === 'new' ? doc(collection(db, 'articles')) : doc(db, 'articles', id);
      const { id: _drop, ...rest } = a;
      const data = clean({ ...rest, title, slug, status: st, publishedAt: a.publishedAt || (st === 'published' ? now : ''), updatedAt: now, createdAt: a.createdAt || now });
      await setDoc(ref, data);
      if (orig && orig.slug !== slug && orig.status === 'published') { // keep old links working (301)
        await setDoc(doc(db, 'redirects', orig.slug), { to: slug });
        const chain = await getDocs(query(collection(db, 'redirects'), where('to', '==', orig.slug)));
        await Promise.all(chain.docs.map((d) => setDoc(d.ref, { to: slug })));
      }
      await deleteDoc(doc(db, 'redirects', slug)).catch(() => {});
      setOrig({ slug, status: st }); setA((p) => ({ ...p, slug, status: st, publishedAt: data.publishedAt }));
      await revalidateSite();
      setMsg(st === 'published' ? 'Published.' : 'Saved.');
      if (id === 'new') router.replace(`/admin/articles/${ref.id}`);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  if (prev) return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', background: '#F8F5EF', zIndex: 60 }}>
      <div className="preview-bar"><span>Preview (not yet public)</span><button className="btn ghost sm" style={{ color: '#fff' }} onClick={() => setPrev(false)}>Back to editor</button></div>
      <ArticleView article={{ ...a, publishedAt: a.publishedAt || new Date().toISOString() }} cat={cat} sub={sub} cats={cats} related={[]} />
    </div>);

  return (<>
    <div className="row sp"><h1>{id === 'new' ? 'New article' : 'Edit article'}</h1>
      <div className="row"><button className="btn ghost" onClick={() => setPrev(true)}>Preview</button>
        <button className="btn ghost" disabled={busy} onClick={() => save()}>Save</button>
        <button className="btn" disabled={busy} onClick={() => save('published')}>{a.status === 'published' ? 'Update' : 'Publish'}</button></div></div>
    <div aria-live="polite">{err && <p className="err" role="alert">{err}</p>}{msg && <p className="ok">{msg}</p>}</div>

    <div className="panel af"><h2>Article information</h2>
      <div><label>Title</label><input value={a.title} onChange={(e) => { set('title', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} /></div>
      <div><label>URL slug</label><input value={a.slug} onChange={(e) => { setTouched(true); set('slug', slugify(e.target.value)); }} /><small>/articles/{a.slug || '...'} . If you change the slug of a published article, the old link redirects automatically.</small></div>
      <div><label>Introduction / excerpt</label><textarea rows={4} value={a.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></div>
      <ImageField label="Featured image" value={a.featuredImage} onChange={(v) => set('featuredImage', v)} />
      <div className="two">
        <div><label>Category</label><select value={a.categoryId} onChange={(e) => setA({ ...a, categoryId: e.target.value, subcategoryId: '' })}><option value="">Choose</option>{cats.filter((c) => !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        <div><label>Subcategory</label><select value={a.subcategoryId} onChange={(e) => set('subcategoryId', e.target.value)}><option value="">None</option>{cats.filter((c) => c.parentId === a.categoryId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        <div><label>Status</label><select value={a.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></select></div>
        <div><label>Publication date</label><input type="datetime-local" value={toLocal(a.publishedAt)} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} /><small>A future date keeps the article hidden until then.</small></div>
        <div><label>Tags (comma separated)</label><input value={(a.tags || []).join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} /></div>
        <label style={{ alignSelf: 'end' }}><input type="checkbox" checked={!!a.featured} onChange={(e) => set('featured', e.target.checked)} /> Show in Featured articles</label>
      </div>
      <div className="two"><div><label>Author name (optional)</label><input value={a.authorName} onChange={(e) => set('authorName', e.target.value)} /></div>
        <div><label>Author page link (optional)</label><input type="url" placeholder="https://" value={a.authorUrl} onChange={(e) => set('authorUrl', e.target.value)} /></div></div>
      <div><label>Author bio (optional)</label><textarea rows={2} value={a.authorBio} onChange={(e) => set('authorBio', e.target.value)} /></div>
    </div>

    <div className="panel"><h2>Sections</h2>
      {!secs.length && <p>No sections yet. Choose a type below and add your first section.</p>}
      {secs.map((s, i) => (<div className="sec" key={s.id}>
        <div className="sec-h"><span>{i + 1}. {LABEL[s.type]}{s.heading ? `: ${s.heading}` : ''}</span>
          <span className="row"><button className="btn ghost sm" disabled={!i} onClick={() => move(i, -1)} aria-label="Move up">Up</button>
            <button className="btn ghost sm" disabled={i === secs.length - 1} onClick={() => move(i, 1)} aria-label="Move down">Down</button>
            <button className="btn danger sm" onClick={() => confirm('Delete this section?') && set('sections', secs.filter((_, j) => j !== i))}>Delete</button></span></div>
        <SectionEditor s={s} set={(v) => setSec(i, v)} /></div>))}
      <div className="row"><select aria-label="Section type" value={addType} onChange={(e) => setAddType(e.target.value)} style={{ padding: '.6rem' }}>{Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn" onClick={() => set('sections', [...secs, { id: uid(), ...NEW[addType] }])}>Add section</button></div>
    </div>

    <div className="panel af"><h2>Conclusion</h2><textarea rows={5} value={a.conclusion} onChange={(e) => set('conclusion', e.target.value)} /></div>

    <div className="panel af"><h2>FAQs</h2>
      {faqs.map((f, i) => (<div className="sec af" key={i}>
        <div><label>Question</label><input value={f.q} onChange={(e) => set('faqs', faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} /></div>
        <div><label>Answer</label><textarea rows={3} value={f.a} onChange={(e) => set('faqs', faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} /></div>
        <div><button className="btn danger sm" onClick={() => set('faqs', faqs.filter((_, j) => j !== i))}>Remove FAQ</button></div></div>))}
      <div><button className="btn ghost" onClick={() => set('faqs', [...faqs, { q: '', a: '' }])}>Add FAQ</button></div></div>

    <div className="panel af"><h2>SEO</h2>
      <div><label>SEO title</label><input value={a.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /><small>{a.seoTitle.length}/60 characters. Leave empty to use the article title.</small></div>
      <div><label>Meta description</label><textarea rows={2} value={a.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} /><small>{a.metaDescription.length}/160 characters. Leave empty to use the excerpt.</small></div>
      <div><label>Canonical URL (optional)</label><input type="url" value={a.canonicalUrl} onChange={(e) => set('canonicalUrl', e.target.value)} /><small>Leave empty unless this content was first published elsewhere.</small></div></div>
  </>);
}
