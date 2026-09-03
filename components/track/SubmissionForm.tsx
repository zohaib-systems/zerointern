"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubmissionFormProps { projectId: string; }

export default function SubmissionForm({ projectId }: SubmissionFormProps) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, repoUrl, liveUrl }) });
      const result: { error?: string } = await response.json();
      if (!response.ok) { setError(result.error ?? "Unable to submit project"); return; }
      router.refresh();
    } catch { setError("Unable to submit project"); }
    finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6"><div><label htmlFor="repoUrl" className="text-sm text-zinc-300">Repository URL</label><input id="repoUrl" type="url" required value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" placeholder="https://github.com/..." /></div><div><label htmlFor="liveUrl" className="text-sm text-zinc-300">Live project URL</label><input id="liveUrl" type="url" required value={liveUrl} onChange={(event) => setLiveUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" placeholder="https://..." /></div>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<button type="submit" disabled={loading} className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-60">{loading ? "Submitting..." : "Submit project"}</button></form>;
}
