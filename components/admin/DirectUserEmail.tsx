'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Recipient = { id: string; name: string | null; email: string };

export default function DirectUserEmail() {
  const [search, setSearch] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (search.trim().length < 2 || selected) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/admin/direct-email?q=${encodeURIComponent(search.trim())}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to search users.');
        setRecipients(data.users);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to search users.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, selected]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/admin/direct-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selected.id, subject, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to queue email.');
      setSuccess(`Email queued for ${selected.email}.`);
      setSelected(null); setSearch(''); setSubject(''); setMessage(''); setRecipients([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to queue email.');
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = 'w-full rounded-lg border border-slate-500 bg-slate-950 px-4 py-3 text-white';
  return <section className="mt-12 rounded-2xl border border-cyan-400/30 bg-slate-800 p-6">
    <p className="text-sm uppercase tracking-widest text-cyan-300">One recipient</p>
    <h2 className="mt-2 text-2xl font-bold">Send an email to a user</h2>
    <p className="mt-2 text-sm text-slate-300">This sends only to the selected account and is delivered even if that user has turned email notifications off. It does not change their email preference.</p>
    <form onSubmit={send} className="mt-6 space-y-5">
      <div>
        <label htmlFor="direct-email-recipient" className="mb-2 block font-medium">Find user by name or email</label>
        <input id="direct-email-recipient" className={fieldClass} value={selected ? `${selected.name || 'Unnamed'} · ${selected.email}` : search} disabled={busy} autoComplete="off" placeholder="Type at least two characters" onChange={event => { setSelected(null); setSearch(event.target.value); setRecipients([]); setError(''); setSuccess(''); }} />
        {search.trim().length >= 2 && !selected && <div className="mt-2 overflow-hidden rounded-lg border border-slate-600" role="listbox" aria-label="Matching users">
          {searching ? <p className="p-3 text-sm text-slate-300">Searching users...</p> : recipients.length ? recipients.map(recipient => <button key={recipient.id} type="button" role="option" aria-selected={false} className="block w-full border-b border-slate-700 px-4 py-3 text-left last:border-b-0 hover:bg-slate-700" onClick={() => { setSelected(recipient); setSearch(''); setRecipients([]); setError(''); }}><span className="block font-medium">{recipient.name || 'Unnamed user'}</span><span className="text-sm text-slate-300">{recipient.email}</span></button>) : <p className="p-3 text-sm text-slate-300">No matching users.</p>}
        </div>}
      </div>
      {selected && <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">Recipient: {selected.name || 'Unnamed user'} · {selected.email}</p>}
      <div><label htmlFor="direct-email-subject" className="mb-2 block font-medium">Subject</label><input id="direct-email-subject" className={fieldClass} required maxLength={150} value={subject} disabled={busy} onChange={event => setSubject(event.target.value)} /></div>
      <div><label htmlFor="direct-email-message" className="mb-2 block font-medium">Message</label><textarea id="direct-email-message" className={fieldClass} required maxLength={5000} rows={7} value={message} disabled={busy} onChange={event => setMessage(event.target.value)} /></div>
      {error && <p role="alert" className="text-red-300">{error}</p>}{success && <p role="status" className="text-emerald-300">{success}</p>}
      <button type="submit" disabled={busy || !selected || !subject.trim() || !message.trim()} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Queueing email...' : 'Send to this user'}</button>
    </form>
  </section>;
}
