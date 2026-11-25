'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { fmtDate } from '@/lib/utils';

export default function Messages() {
  const [m, setM] = useState(null), [subs, setSubs] = useState([]);
  const load = () => getDocs(collection(db, 'contacts')).then((s) => setM(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  useEffect(() => { load(); getDocs(collection(db, 'subscribers')).then((s) => setSubs(s.docs.map((d) => d.data().email))); }, []);
  return (<><h1>Messages</h1>
    {!m ? <p>Loading</p> : !m.length ? <p className="notice">No messages yet.</p> : m.map((x) => (
      <div className="panel" key={x.id}><div className="row sp"><strong>{x.name} ({x.email})</strong><small>{fmtDate(x.createdAt)}</small></div>
        {x.subject && <p><em>{x.subject}</em></p>}<p style={{ whiteSpace: 'pre-wrap' }}>{x.message}</p>
        <div className="row"><a className="btn ghost sm" href={`mailto:${x.email}`}>Reply by email</a>
          <button className="btn danger sm" onClick={async () => { if (confirm('Delete message?')) { await deleteDoc(doc(db, 'contacts', x.id)); load(); } }}>Delete</button></div></div>))}
    <div className="panel af"><h2>Newsletter subscribers ({subs.length})</h2><textarea readOnly rows={4} value={subs.join(', ')} aria-label="Subscriber emails" /></div></>);
}
