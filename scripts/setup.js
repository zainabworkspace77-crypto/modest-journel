// Run once: npm run setup-db
// Creates default settings, pages, starter categories and your admin login.
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') }) });
const db = getFirestore(app), auth = getAuth(app);
const now = new Date().toISOString();

async function setIfMissing(path, data) {
  const ref = db.doc(path);
  if (!(await ref.get()).exists) { await ref.set(data); console.log('created', path); }
}
(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) in .env.local');
  let user;
  try { user = await auth.getUserByEmail(ADMIN_EMAIL); } catch { user = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }); console.log('created auth user', ADMIN_EMAIL); }
  await db.doc(`admins/${user.uid}`).set({ email: ADMIN_EMAIL, createdAt: now }, { merge: true });
  await setIfMissing('settings/site', { siteTitle: 'The Modest Edit', description: 'Modest fashion and hijab styling, written with care.', newsletterEnabled: true, social: {}, createdAt: now });
  const pages = {
    about: ['About', 'Write about yourself and this blog here.\n\n## Our approach\nShare what readers can expect from this site.'],
    privacy: ['Privacy Policy', 'Replace this with your privacy policy.'],
    terms: ['Terms and Conditions', 'Replace this with your terms and conditions.'],
  };
  for (const [slug, [title, body]] of Object.entries(pages)) await setIfMissing(`pages/${slug}`, { title, body, seoTitle: '', metaDescription: '', updatedAt: now });
  const cats = [['Hijab Styles', 'hijab-styles', 'Wrapping styles, fabrics and colour pairings for every day.'], ['Modest Outfits', 'modest-outfits', 'Tops, skirts, dresses and layering ideas.']];
  for (const [i, [title, slug, description]] of cats.entries()) await setIfMissing(`categories/${slug}`, { title, slug, description, parentId: '', order: i, image: '', seoTitle: '', metaDescription: '', createdAt: now });
  console.log('Done. Sign in at /admin with', ADMIN_EMAIL, '- then delete ADMIN_PASSWORD from .env.local');
})().catch((e) => { console.error(e.message); process.exit(1); });
