import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { mapProject, mapTrack } from "@/lib/data";
import EnrollButton from "@/components/track/EnrollButton";

export default async function ExploreTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("tracks").select("*, projects(*)").eq("id", trackId).maybeSingle();
  if (error || !data) notFound();
  const track = mapTrack(data as unknown as Record<string, unknown>);
  const projectRows = Array.isArray(data.projects) ? (data.projects as unknown[]) : [];
  const projects = projectRows.map((project) => mapProject(project as Record<string, unknown>)).sort((a, b) => a.projectOrder - b.projectOrder);
  const user = await getUser();
  const { data: enrollment } = user ? await supabase.from("track_enrollments").select("id").eq("user_id", user.id).eq("track_id", trackId).maybeSingle() : { data: null };

  return <main className="min-h-screen bg-[#0b0b0f] text-white"><section className="mx-auto max-w-5xl px-6 py-12"><Link href="/explore" className="text-sm text-cyan-300 hover:text-cyan-200">← All tracks</Link><div className="mt-8 flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between"><div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs capitalize text-cyan-300">{track.level}</span><h1 className="mt-4 text-4xl font-bold">{track.title}</h1><p className="mt-4 max-w-2xl text-zinc-400">{track.description}</p></div>{enrollment ? <Link href={`/dashboard/tracks/${track.id}`} className="rounded-lg border border-emerald-400/30 px-5 py-3 text-center font-medium text-emerald-300">Go to Dashboard</Link> : user ? <EnrollButton trackId={track.id} /> : <Link href={`/auth/signin?next=/explore/${track.id}`} className="rounded-lg bg-cyan-500 px-5 py-3 text-center font-medium text-slate-950">Sign in to enroll</Link>}</div><div className="mt-10"><h2 className="text-2xl font-bold">Projects in this track</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm text-cyan-300">Project {project.projectOrder}</p><h3 className="mt-3 text-xl font-semibold">{project.title}</h3><p className="mt-3 text-sm text-zinc-400">{project.description}</p><div className="mt-4 rounded-lg border-l-2 border-amber-400 px-4 py-2 text-sm text-zinc-300">{project.problem}</div><div className="mt-4 flex flex-wrap gap-2">{project.concepts.map((concept) => <span key={concept} className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">{concept}</span>)}</div></article>)}</div></div></section></main>;
}
