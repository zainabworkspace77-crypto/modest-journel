'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseClient';

const NAV = [['/admin', 'Overview'], ['/admin/articles', 'Articles'], ['/admin/categories', 'Categories'], ['/admin/media', 'Media Library'], ['/admin/pages', 'Pages'], ['/admin/seo', 'SEO Settings'], ['/admin/settings', 'Website Settings'], ['/admin/messages', 'Messages']];

export default function AdminShell({ children }) {
  const [state, setState] = useState('loading'); const path = usePathname();
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('');
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return setState('out');
    try { setState((await getDoc(doc(db, 'admins', u.uid))).exists() ? 'in' : 'denied'); } catch { setState('denied'); }
  }), []);
  async function login(e) {
    e.preventDefault(); setErr('');
    try { await signInWithEmailAndPassword(auth, email, pw); } catch { setErr('Sign in failed. Check your email and password.'); }
  }
  if (state === 'loading') return <p style={{ padding: '2rem' }}>Loading</p>;
  if (state === 'out') return (
    <form className="login af" onSubmit={login}>
      <h1>Admin sign in</h1>
      <div><label htmlFor="e">Email</label><input id="e" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn">Sign in</button>
    </form>);
  if (state === 'denied') return (
    <div className="login"><h1>No access</h1><p>This account is not an administrator.</p><button className="btn" onClick={() => signOut(auth)}>Sign out</button></div>);
  return (
    <div className="adm">
      <nav className="adm-side" aria-label="Admin">
        <strong>Dashboard</strong>
        {NAV.map(([h, t]) => <Link key={h} href={h} className={path === h || (h !== '/admin' && path.startsWith(h)) ? 'on' : ''}>{t}</Link>)}
        <a href="/" target="_blank" rel="noopener">View site</a>
        <button onClick={() => signOut(auth)}>Sign out</button>
      </nav>
      <div className="adm-main">{children}</div>
    </div>
  );
}
