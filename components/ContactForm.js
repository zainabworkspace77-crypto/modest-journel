'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [err, setErr] = useState({}); const [state, setState] = useState('idle');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function validate() {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
    if (f.message.trim().length < 10) e.message = 'Please write at least 10 characters.';
    return e;
  }
  async function submit(ev) {
    ev.preventDefault();
    const e = validate(); setErr(e); if (Object.keys(e).length) return;
    setState('sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) { setErr(d.errors || { form: d.error || 'Something went wrong.' }); setState('idle'); return; }
      setState('sent'); setF({ name: '', email: '', subject: '', message: '', website: '' });
    } catch { setErr({ form: 'Network error. Please try again.' }); setState('idle'); }
  }
  if (state === 'sent') return <p role="status" className="notice">Thank you. Your message has been sent.</p>;
  const field = (k, label, type = 'text', area) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      {area ? <textarea id={k} rows={6} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? k + '-e' : undefined} />
        : <input id={k} type={type} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? k + '-e' : undefined} />}
      {err[k] && <p className="err" id={k + '-e'}>{err[k]}</p>}
    </div>
  );
  return (
    <form onSubmit={submit} noValidate className="form">
      {field('name', 'Your name')}{field('email', 'Email address', 'email')}{field('subject', 'Subject (optional)')}{field('message', 'Message', 'text', true)}
      <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
      <div aria-live="polite">{err.form && <p className="err">{err.form}</p>}</div>
      <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send message'}</button>
    </form>
  );
}
