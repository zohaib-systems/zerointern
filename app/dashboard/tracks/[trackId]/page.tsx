import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { mapProject, mapTrack } from "@/lib/data";
import ProjectCard from "@/components/track/ProjectCard";
import ProgressBar from "@/components/track/ProgressBar";

export default async function DashboardTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const { trackId } = await params;
  const supabase = await createClient();
  const { data: enrollment } = await supabase.from("track_enrollments").select("id").eq("user_id", user.id).eq("track_id", trackId).maybeSingle();
  if (!enrollment) redirect(`/explore/${trackId}`);
  const { data, error } = await supabase.from("tracks").select("*, projects(*)").eq("id", trackId).maybeSingle();
  if (error || !data) notFound();
  const track = mapTrack(data as unknown as Record<string, unknown>);
  const projectRows = Array.isArray(data.projects) ? (data.projects as unknown[]) : [];
  const projects = projectRows.map((project) => mapProject(project as Record<string, unknown>)).sort((a, b) => a.projectOrder - b.projectOrder);
  const { data: submissions } = await supabase.from("submissions").select("project_id, status").eq("user_id", user.id).in("project_id", projects.map((project) => project.id));
  const submissionMap = new Map((submissions ?? []).map((submission) => [submission.project_id, submission.status]));
  const completed = projects.filter((project) => submissionMap.get(project.id) === "APPROVED").length;
  return <main className="min-h-screen bg-[#0b0b0f] text-white"><section className="mx-auto max-w-5xl px-6 py-12"><Link href="/dashboard" className="text-sm text-cyan-300">← Dashboard</Link><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]"><div><p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Your track</p><h1 className="mt-3 text-4xl font-bold">{track.title}</h1><p className="mt-4 text-zinc-400">{track.description}</p><div className="mt-10 space-y-5">{projects.map((project) => { const raw = submissionMap.get(project.id); const status = raw === "APPROVED" ? "Approved" : raw ? raw === "REJECTED" ? "Rejected" : "Submitted" : "Not Started"; return <ProjectCard key={project.id} project={project} status={status} href={`/dashboard/projects/${project.id}`} />; })}</div></div><aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm text-zinc-400">Progress</p><p className="mt-2 text-3xl font-bold">{completed}/4</p><div className="mt-4"><ProgressBar completed={completed} total={4} /></div><p className="mt-3 text-sm text-zinc-500">Approved projects</p></aside></div></section></main>;
}
