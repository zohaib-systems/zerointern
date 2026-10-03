'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { Announcement } from '@/lib/announcements';

export default function NotificationInbox() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {

    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load notifications. Please try again.');
      const data = await response.json(); setItems(data.notifications); setError('');
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to load notifications'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  async function markRead(ids: string[]) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      if (!response.ok) throw new Error('Unable to mark notifications read. Please try again.');
      setItems(previous => previous.map(item => ids.includes(item.id) ? { ...item, read: true } : item));
      window.dispatchEvent(new Event('notifications-read'));
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save'); }
    finally { setBusy(false); }
  }
  const unread = items.filter(item => !item.read);
  return <div className="zi-stack">
    <div className="flex flex-wrap gap-3"><button className="zi-btn zi-btn-secondary" onClick={() => { setLoading(true); void load(); }} disabled={loading || busy}>Refresh</button>{unread.length > 0 && <button className="zi-btn zi-btn-primary" disabled={busy || loading} onClick={() => void markRead(unread.map(item => item.id))}>Mark all as read</button>}</div>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Loading notifications...</p> : items.length === 0 && !error ? <div className="zi-panel"><h2>You&apos;re all caught up</h2><p>Announcements from ZeroIntern will appear here.</p></div> : items.map(item => <article key={item.id} className={`zi-panel zi-announcement ${item.read ? '' : 'zi-announcement-unread'}`}>
      <div className="flex flex-wrap items-center gap-3"><h2>{item.title}</h2>{!item.read && <span className="zi-badge neutral">Unread</span>}</div>
      <time className="zi-caption" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time><p className="whitespace-pre-wrap">{item.message}</p>
      <div className="flex flex-wrap gap-3"><Link className="zi-btn zi-btn-primary" href={item.path}>{item.path === '/dashboard/settings' ? 'Open settings' : item.path === '/dashboard/certificates' ? 'View certificates' : 'Go to dashboard'}</Link>{!item.read && <button className="zi-btn zi-btn-secondary" disabled={busy} onClick={() => void markRead([item.id])}>Mark as read</button>}</div>
    </article>)}
    <p className="zi-caption">Showing the latest 100 announcements.</p>
  </div>;
}
