# The Modest Edit: Next.js + Firebase blog

Public site (server-rendered, SEO-ready) + private admin at `/admin`.

## Quick start
1. `npm install`
2. `cp .env.example .env.local` and fill in the Firebase keys (see below)
3. Paste `firestore.rules` into Firebase Console > Firestore > Rules, and `storage.rules` into Storage > Rules. Publish both.
4. `npm run setup-db` (creates settings, pages, 2 starter categories and your admin login)
5. Remove `ADMIN_PASSWORD` from `.env.local`
6. `npm run dev` then open http://localhost:3000 and http://localhost:3000/admin

## Deploy (Vercel)
Push to GitHub, import in Vercel, add every variable from `.env.local` (except ADMIN_*) in Project > Settings > Environment Variables,
set NEXT_PUBLIC_SITE_URL to your real domain, deploy. Add the Vercel domain in Firebase > Authentication > Settings > Authorized domains.

## Structure
- `app/(site)` public pages · `app/admin` dashboard (client-side, Firebase Auth) · `app/api` contact, newsletter, views, revalidate
- `lib/data.js` cached server reads (Admin SDK) · `components/admin` editor, media, settings
- Data (Firestore): articles, categories (parentId = subcategory), media, pages, settings/site, redirects, contacts, subscribers, admins
