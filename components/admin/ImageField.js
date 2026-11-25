'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { uploadImage } from '@/lib/adminLib';

export function MediaPicker({ onPick, onClose }) {
  const [items, setItems] = useState(null);
  useEffect(() => { getDocs(collection(db, 'media')).then((s) => setItems(s.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')))); }, []);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Media library" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="row sp"><h2>Choose an image</h2><button type="button" className="btn ghost sm" onClick={onClose}>Close</button></div>
        {!items ? <p>Loading</p> : !items.length ? <p>No images yet. Upload one first.</p> :
          <div className="media-grid">{items.map((m) => (
            <button type="button" key={m.id} className="item" onClick={() => { onPick(m); onClose(); }} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <img src={m.thumb || m.url} alt={m.alt || m.name} /><small>{m.name}</small></button>))}</div>}
      </div>
    </div>
  );
}

export default function ImageField({ label, value, onChange, meta = true }) {
  const [busy, setBusy] = useState(false), [pick, setPick] = useState(false), [err, setErr] = useState('');
  const fromMedia = (m) => ({ url: m.url, thumb: m.thumb, w: m.w, h: m.h, alt: m.alt || '', caption: m.caption || '' });
  async function up(e) {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
    setBusy(true); setErr('');
    try { onChange(fromMedia(await uploadImage(f))); } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  return (
    <div className="panel" style={{ marginBottom: 0 }}>
      <label style={{ fontWeight: 600, fontSize: '.9rem' }}>{label}</label>
      <div className="row" style={{ margin: '.6rem 0' }}>
        {value?.url && <img className="thumb" src={value.thumb || value.url} alt="" />}
        <label className="btn ghost sm" style={{ cursor: 'pointer' }}>{busy ? 'Uploading' : value?.url ? 'Replace image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={up} hidden disabled={busy} /></label>
        <button type="button" className="btn ghost sm" onClick={() => setPick(true)}>Media library</button>
        {value?.url && <button type="button" className="btn danger sm" onClick={() => onChange(null)}>Remove</button>}
      </div>
      {err && <p className="err">{err}</p>}
      {meta && value?.url && <div className="two af">
        <div><label>Alt text (describe the image)</label><input value={value.alt || ''} onChange={(e) => onChange({ ...value, alt: e.target.value })} /></div>
        <div><label>Caption (optional)</label><input value={value.caption || ''} onChange={(e) => onChange({ ...value, caption: e.target.value })} /></div></div>}
      {pick && <MediaPicker onPick={(m) => onChange(fromMedia(m))} onClose={() => setPick(false)} />}
    </div>
  );
}
// For settings that store a plain URL string (logo, favicon, banners)
export function UrlImageField({ label, value, onChange }) {
  return <ImageField label={label} meta={false} value={value ? { url: value } : null} onChange={(v) => onChange(v?.url || '')} />;
}
export function GalleryField({ images = [], onChange }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  async function up(e) {
    const files = [...(e.target.files || [])]; e.target.value = ''; setBusy(true); setErr('');
    const added = [];
    for (const f of files) { try { const m = await uploadImage(f); added.push({ url: m.url, thumb: m.thumb, w: m.w, h: m.h, alt: '', caption: '' }); } catch (x) { setErr(x.message); } }
    onChange([...images, ...added]); setBusy(false);
  }
  return (
    <div>
      <label className="btn ghost sm" style={{ cursor: 'pointer' }}>{busy ? 'Uploading' : 'Upload multiple images'}<input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={up} disabled={busy} /></label>
      {err && <p className="err">{err}</p>}
      <div style={{ display: 'grid', gap: '.8rem', marginTop: '.8rem' }}>{images.map((im, i) => (
        <ImageField key={i} label={`Image ${i + 1}`} value={im} onChange={(v) => onChange(v ? images.map((x, j) => (j === i ? v : x)) : images.filter((_, j) => j !== i))} />))}</div>
    </div>
  );
}
