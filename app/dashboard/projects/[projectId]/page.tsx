import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { mapProject } from "@/lib/data";
import SubmissionForm from "@/components/project/SubmissionForm";
import SubmissionStatus from "@/components/project/SubmissionStatus";

export default async function DashboardProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const { projectId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (error || !data) notFound();
  const project = mapProject(data as unknown as Record<string, unknown>);
  const { data: submissionRow } = await supabase.from("submissions").select("*").eq("user_id", user.id).eq("project_id", projectId).maybeSingle();
  const submission = submissionRow ? { id: submissionRow.id, userId: submissionRow.user_id, projectId: submissionRow.project_id, repoUrl: submissionRow.repo_url, liveUrl: submissionRow.live_url, status: submissionRow.status, adminNotes: submissionRow.admin_notes, submittedAt: submissionRow.submitted_at, approvedAt: submissionRow.approved_at, createdAt: submissionRow.created_at, updatedAt: submissionRow.updated_at } : null;
  return <main className="min-h-screen bg-[#0b0b0f] text-white"><section className="mx-auto max-w-4xl px-6 py-12"><Link href={`/dashboard/tracks/${project.trackId}`} className="text-sm text-cyan-300">← Track dashboard</Link><p className="mt-8 text-sm uppercase tracking-[0.2em] text-cyan-300">Project {project.projectOrder} of 4</p><h1 className="mt-3 text-4xl font-bold">{project.title}</h1><div className="mt-8 rounded-2xl border-l-4 border-amber-400 bg-amber-400/10 p-6"><h2 className="font-semibold text-amber-200">The business problem</h2><p className="mt-3 leading-7 text-zinc-300">{project.problem}</p></div><article className="mt-8"><h2 className="text-2xl font-bold">Project brief</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">{project.brief}</p></article><div className="mt-8"><h2 className="text-2xl font-bold">Skills you will practice</h2><div className="mt-4 flex flex-wrap gap-2">{project.concepts.map((concept) => <span key={concept} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300">{concept}</span>)}</div></div><section className="mt-10"><h2 className="text-2xl font-bold">Resources</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{project.resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-400/40"><span className="text-xs uppercase text-cyan-300">{resource.type}</span><span className="mt-2 block font-medium">{resource.title} ↗</span></a>)}</div></section><section className="mt-10"><h2 className="text-2xl font-bold">Submission</h2><div className="mt-4">{submission ? <><SubmissionStatus submission={submission} />{submission.status === "REJECTED" && <div className="mt-4"><h3 className="text-lg font-semibold">Update your submission</h3><SubmissionForm projectId={project.id} initialRepoUrl={submission.repoUrl} initialLiveUrl={submission.liveUrl} /></div>}</> : <SubmissionForm projectId={project.id} />}</div></section></section></main>;
}
