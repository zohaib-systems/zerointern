import type { Submission } from "@/types";

interface SubmissionStatusProps { submission: Submission; }
const labels = { PENDING: "Pending Review", APPROVED: "Approved ✓", REJECTED: "Rejected ❌" } as const;
export default function SubmissionStatus({ submission }: SubmissionStatusProps) {
  const color = submission.status === "APPROVED" ? "text-emerald-300 bg-emerald-400/10" : submission.status === "REJECTED" ? "text-red-200 bg-red-950" : "text-amber-300 bg-amber-400/10";
  return <div className="rounded-2xl border border-slate-600 bg-slate-800 p-6"><span className={`rounded-full px-3 py-1 text-sm ${color}`}>{labels[submission.status]}</span><p className="mt-4 text-sm text-slate-300">Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p><div className="mt-4 flex flex-wrap gap-4 text-sm"><a href={submission.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Repository ↗</a><a href={submission.liveUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Live project ↗</a></div>{submission.status === "REJECTED" && submission.adminNotes && <p className="mt-4 border-l-2 border-rose-400 pl-3 text-sm text-slate-300">{submission.adminNotes}</p>}</div>;
}
