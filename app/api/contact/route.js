import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { limited, ipOf } from '@/lib/rateLimit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export async function POST(req) {
  if (limited('contact:' + ipOf(req), 5)) return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const name = String(b.name || '').trim(), email = String(b.email || '').trim();
  const subject = String(b.subject || '').trim(), message = String(b.message || '').trim();
  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = 'Please enter your name (2–100 characters).';
  if (!EMAIL.test(email) || email.length > 200) errors.email = 'Please enter a valid email address.';
  if (subject.length > 150) errors.subject = 'Subject is too long (max 150 characters).';
  if (message.length < 10 || message.length > 3000) errors.message = 'Message must be 10–3000 characters.';
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });
  await db.collection('contacts').add({ name, email, subject, message, read: false, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
