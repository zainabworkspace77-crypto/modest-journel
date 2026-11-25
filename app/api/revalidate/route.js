import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { adminAuth, db } from '@/lib/firebaseAdmin';

// Called by the admin dashboard after every save so changes show on the public site immediately.
export async function POST(req) {
  try {
    const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
    const { uid } = await adminAuth.verifyIdToken(token);
    if (!(await db.doc(`admins/${uid}`).get()).exists) throw new Error('not admin');
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  revalidateTag('site');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
