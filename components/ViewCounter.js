'use client';
import { useEffect } from 'react';
export default function ViewCounter({ id }) {
  useEffect(() => { fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {}); }, [id]);
  return null;
}
