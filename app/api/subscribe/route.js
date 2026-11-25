import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { limited, ipOf } from '@/lib/rateLimit';

export async function POST(req) {
  if (limited('sub:' + ipOf(req), 5)) return NextResponse.json({ error: 'Too many attempts. Please try later.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  const id = Buffer.from(email).toString('base64url');
  await db.doc(`subscribers/${id}`).set({ email, createdAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true });
}
