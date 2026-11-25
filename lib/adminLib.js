import { auth, db, storage } from './firebaseClient';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { uid } from './utils';

export const clean = (o) => JSON.parse(JSON.stringify(o)); // Firestore rejects undefined
export async function revalidateSite() {
  try { const t = await auth.currentUser.getIdToken(); await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: 'Bearer ' + t } }); } catch {}
}
const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const publicUrl = (p) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(p)}?alt=media`;

async function toWebp(bmp, max) {
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.82));
  if (!blob || blob.type !== 'image/webp') throw new Error('Your browser cannot convert images to WebP. Please use a recent Chrome, Edge, Firefox or Safari.');
  return { blob, w, h };
}
// Validates, compresses to WebP (1600px + 600px thumbnail), uploads, and records it in the media library.
// Pass `existing` (a media doc) to REPLACE the files while keeping the same URLs.
export async function uploadImage(file, existing) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Only JPG, PNG or WebP images are allowed.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image is larger than 12 MB. Please choose a smaller file.');
  const bmp = await createImageBitmap(file);
  const [big, small] = await Promise.all([toWebp(bmp, 1600), toWebp(bmp, 600)]);
  const id = existing?.id || uid() + uid();
  const path = existing?.path || `media/${id}.webp`, thumbPath = existing?.thumbPath || `media/${id}-600.webp`;
  const meta = { contentType: 'image/webp', cacheControl: 'public,max-age=3600' };
  await Promise.all([uploadBytes(ref(storage, path), big.blob, meta), uploadBytes(ref(storage, thumbPath), small.blob, meta)]);
  const rec = { id, path, thumbPath, url: publicUrl(path), thumb: publicUrl(thumbPath), w: big.w, h: big.h, name: existing?.name || file.name, alt: existing?.alt || '', caption: existing?.caption || '', createdAt: existing?.createdAt || new Date().toISOString() };
  await setDoc(doc(db, 'media', id), rec);
  return rec;
}
export async function deleteMediaFiles(m) {
  await Promise.all([m.path, m.thumbPath].filter(Boolean).map((p) => deleteObject(ref(storage, p)).catch(() => {})));
}
