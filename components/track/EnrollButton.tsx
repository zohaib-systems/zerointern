"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EnrollButtonProps { trackId: string; }

export default function EnrollButton({ trackId }: EnrollButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tracks/enroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId }) });
      const result: { error?: string } = await response.json();
      if (response.status === 401) { router.push(`/auth/signin?next=/explore/${trackId}`); return; }
      if (!response.ok) { setError(result.error ?? "Unable to enroll"); return; }
      router.push(`/dashboard/tracks/${trackId}`);
      router.refresh();
    } catch { setError("Unable to enroll"); }
    finally { setLoading(false); }
  }

  return <div><button type="button" onClick={enroll} disabled={loading} className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Enrolling..." : "Enroll Now"}</button>{error && <p className="mt-2 text-sm text-rose-300" role="alert">{error}</p>}</div>;
}
