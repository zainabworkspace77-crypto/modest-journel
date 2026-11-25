import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';
import { limited, ipOf } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string' || id.includes('/') || limited(`v:${ipOf(req)}:${id}`, 1, 30 * 60 * 1000)) return NextResponse.json({ ok: true });
    await db.doc(`articles/${id}`).update({ views: FieldValue.increment(1) });
  } catch {}
  return NextResponse.json({ ok: true });
}
