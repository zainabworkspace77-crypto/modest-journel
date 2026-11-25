'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { uploadImage, deleteMediaFiles } from '@/lib/adminLib';

export default function Media() {
  const [items, setItems] = useState(null), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const load = () => getDocs(collection(db, 'media')).then((s) => setItems(s.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))));
  useEffect(() => { load(); }, []);
  async function up(e) {
    const files = [...e.target.files]; e.target.value = ''; setBusy(true); setErr('');
    for (const f of files) { try { await uploadImage(f); } catch (x) { setErr(`${f.name}: ${x.message}`); } }
    setBusy(false); load();
  }
  const edit = (id, k, v) => setItems(items.map((m) => (m.id === id ? { ...m, [k]: v } : m)));
  const saveMeta = (m) => updateDoc(doc(db, 'media', m.id), { alt: m.alt || '', caption: m.caption || '' });
  async function replace(m, e) { const f = e.target.files[0]; e.target.value = ''; if (!f) return; setErr(''); try { await uploadImage(f, m); load(); } catch (x) { setErr(x.message); } }
  async function del(m) {
    if (!confirm('Delete this image? Articles still using it will show a broken image.')) return;
    await deleteMediaFiles(m); await deleteDoc(doc(db, 'media', m.id)); load();
  }
  return (<>
    <div className="row sp"><h1>Media Library</h1>
      <label className="btn" style={{ cursor: 'pointer' }}>{busy ? 'Uploading' : 'Upload images'}<input type="file" multiple hidden accept="image/jpeg,image/png,image/webp" onChange={up} disabled={busy} /></label></div>
    <p>Images are converted to WebP and resized automatically (1600px plus a 600px version for mobile). JPG, PNG or WebP, up to 12 MB each.</p>
    {err && <p className="err" role="alert">{err}</p>}
    {!items ? <p>Loading</p> : !items.length ? <p className="notice">No images yet. Upload your first image.</p> :
      <div className="media-grid">{items.map((m) => (<div className="item af" key={m.id}>
        <img src={m.thumb || m.url} alt={m.alt || ''} loading="lazy" />
        <div><label>Alt text</label><input value={m.alt || ''} onChange={(e) => edit(m.id, 'alt', e.target.value)} onBlur={() => saveMeta(m)} /></div>
        <div><label>Caption</label><input value={m.caption || ''} onChange={(e) => edit(m.id, 'caption', e.target.value)} onBlur={() => saveMeta(m)} /></div>
        <div className="row"><label className="btn ghost sm" style={{ cursor: 'pointer' }}>Replace<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => replace(m, e)} /></label>
          <button className="btn ghost sm" onClick={() => navigator.clipboard?.writeText(m.url)}>Copy URL</button>
          <button className="btn danger sm" onClick={() => del(m)}>Delete</button></div></div>))}</div>}
  </>);
}
