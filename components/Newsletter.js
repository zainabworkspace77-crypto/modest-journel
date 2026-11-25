'use client';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); const [ok, setOk] = useState(false);
  async function go(e) {
    e.preventDefault(); setMsg('');
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setOk(true); setMsg('Thank you for subscribing.'); setEmail(''); } else setMsg(d.error || 'Something went wrong.');
  }
  return (
    <section className="newsletter" aria-labelledby="nl-h">
      <div className="wrap narrow">
        <h2 id="nl-h">New articles, in your inbox</h2>
        <p>Occasional styling guides. No spam.</p>
        <form onSubmit={go} className="inline-form">
          <label htmlFor="nl-email" className="sr">Email address</label>
          <input id="nl-email" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn">Subscribe</button>
        </form>
        <p role="status" className={ok ? 'ok' : 'err'}>{msg}</p>
      </div>
    </section>
  );
}
