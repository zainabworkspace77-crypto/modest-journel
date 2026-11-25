'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { revalidateSite, clean } from '@/lib/adminLib';
import { UrlImageField } from './ImageField';

const SOCIAL = ['instagram', 'pinterest', 'facebook', 'tiktok', 'youtube', 'x'];
export default function SettingsForm({ group }) {
  const [s, setS] = useState(null), [msg, setMsg] = useState('');
  useEffect(() => { getDoc(doc(db, 'settings', 'site')).then((d) => setS({ social: {}, newsletterEnabled: true, ...(d.data() || {}) })); }, []);
  if (!s) return <p>Loading</p>;
  const t = (k, label, hint, area) => (<div><label>{label}</label>{area ? <textarea rows={3} value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /> : <input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />}{hint && <small>{hint}</small>}</div>);
  const img = (k, label) => <UrlImageField label={label} value={s[k]} onChange={(v) => setS({ ...s, [k]: v })} />;
  async function save() { await setDoc(doc(db, 'settings', 'site'), clean({ ...s, updatedAt: new Date().toISOString() }), { merge: true }); await revalidateSite(); setMsg('Saved.'); }
  return (<>
    <h1>{group === 'seo' ? 'SEO Settings' : 'Website Settings'}</h1>
    <div className="panel af">
      {group === 'seo' ? <>
        {t('gaId', 'Google Analytics 4 measurement ID', 'Looks like G-XXXXXXXXXX. Leave empty to disable tracking.')}
        {t('gscVerification', 'Google Search Console verification code', 'Only the content value from the google-site-verification meta tag.')}
        {img('defaultOgImage', 'Default social sharing image')}
        <p>Your sitemap is at <code>/sitemap.xml</code> and robots.txt at <code>/robots.txt</code>. Submit the sitemap in Search Console. Per-article and per-category SEO fields are in their own editors.</p>
      </> : <>
        {t('siteTitle', 'Website title')}{t('tagline', 'Tagline', 'Shown in the browser title of the homepage.')}{t('description', 'Website description', 'Used as the homepage meta description.', true)}
        {img('logo', 'Logo (optional, text is used if empty)')}{img('favicon', 'Favicon')}
        <h2>Homepage hero</h2>{t('heroTitle', 'Headline')}{t('heroIntro', 'Introduction', '', true)}{img('heroImage', 'Hero image')}
        <label><input type="checkbox" checked={!!s.newsletterEnabled} onChange={(e) => setS({ ...s, newsletterEnabled: e.target.checked })} /> Show newsletter section on homepage</label>
        <h2>Footer and social</h2>{t('footerText', 'Footer text', '', true)}{t('contactEmail', 'Public contact email')}
        {SOCIAL.map((k) => <div key={k}><label style={{ textTransform: 'capitalize' }}>{k} URL</label><input type="url" placeholder="https://" value={s.social?.[k] || ''} onChange={(e) => setS({ ...s, social: { ...s.social, [k]: e.target.value } })} /></div>)}
      </>}
      <div className="row"><button className="btn" onClick={save}>Save settings</button>{msg && <span className="ok" role="status">{msg}</span>}</div>
    </div></>);
}
