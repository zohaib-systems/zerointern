'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Announcement } from '@/lib/announcements';

export default function AnnouncementComposer() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [path, setPath] = useState('/dashboard');
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [success, setSuccess] = useState('');
  const load = useCallback(async () => {

    try {
      const response = await fetch('/api/admin/announcements', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load announcement history.');
      const data = await response.json(); setItems(data.announcements); setHistoryError('');
    } catch (error) { setHistoryError(error instanceof Error ? error.message : 'Unable to load announcements'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  function useReminder() {
    setTitle('Enable email notifications');
    setMessage('Stay updated on project approvals, requests for changes, and certificates. Open Settings and turn on Email notifications to receive updates at your account email.');
    setPath('/dashboard/settings'); setSuccess('');
  }
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message, path }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to publish announcement');
      setItems(previous => [data.announcement, ...previous].slice(0, 100));
      setTitle(''); setMessage(''); setPath('/dashboard');
      setSuccess('Announcement published to all user dashboards.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to publish'); }
    finally { setBusy(false); }
  }
  const fieldClass = 'w-full rounded-lg border border-slate-500 bg-slate-950 px-4 py-3 text-white';
  return <>
    <form onSubmit={publish} className="mt-8 space-y-5 rounded-2xl border border-slate-600 bg-slate-800 p-6">
      <button type="button" disabled={busy} onClick={useReminder} className="rounded-lg border border-cyan-400 px-4 py-2 text-cyan-200">Use email reminder</button>
      <div><label htmlFor="announcement-title" className="mb-2 block font-medium">Title</label><input id="announcement-title" className={fieldClass} required maxLength={120} value={title} disabled={busy} onChange={event => setTitle(event.target.value)} /></div>
      <div><label htmlFor="announcement-message" className="mb-2 block font-medium">Message</label><textarea id="announcement-message" className={fieldClass} required maxLength={2000} rows={5} value={message} disabled={busy} onChange={event => setMessage(event.target.value)} /></div>
      <div><label htmlFor="announcement-path" className="mb-2 block font-medium">Link destination</label><select id="announcement-path" className={fieldClass} disabled={busy} value={path} onChange={event => setPath(event.target.value)}><option value="/dashboard">Dashboard</option><option value="/dashboard/settings">Settings / email preferences</option><option value="/dashboard/certificates">Certificates</option></select></div>
      <div className="rounded-lg border border-slate-500 bg-slate-900 p-4"><p className="text-sm text-cyan-200">Preview  -  All users</p><h2 className="mt-2 break-words text-xl font-semibold">{title.trim() || 'Announcement title'}</h2><p className="mt-2 whitespace-pre-wrap break-words text-slate-300">{message.trim() || 'Your message will appear here.'}</p></div>
      <p className="text-sm text-slate-300">Visible to all signed-in users, including future users. This publishes an in-app notification; email preferences remain the user&apos;s choice.</p>
      {error && <p role="alert" className="text-red-300">{error}</p>}{success && <p role="status" className="text-emerald-300">{success}</p>}
      <button type="submit" disabled={busy || !title.trim() || !message.trim()} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Publishing...' : 'Publish to all users'}</button>
    </form>
    <div className="mt-12 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Published announcements</h2><button onClick={() => { setLoading(true); void load(); }} disabled={loading || busy} className="rounded-lg border border-slate-600 px-4 py-2">Refresh</button></div>
    {historyError && <p role="alert" className="mt-4 text-red-300">{historyError}</p>}
    <div className="mt-4 space-y-4">{loading ? <p role="status">Loading history...</p> : items.length === 0 && !historyError ? <p className="text-slate-300">No announcements published yet.</p> : items.map(item => <article key={item.id} className="rounded-xl border border-slate-600 bg-slate-800 p-5"><h3 className="break-words text-lg font-semibold">{item.title}</h3><time className="text-sm text-slate-400" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time><p className="mt-3 whitespace-pre-wrap break-words text-slate-200">{item.message}</p><p className="mt-3 text-sm text-cyan-200">All users  -  {item.path === '/dashboard/settings' ? 'Settings' : item.path === '/dashboard/certificates' ? 'Certificates' : 'Dashboard'}</p></article>)}</div>
  </>;
}
