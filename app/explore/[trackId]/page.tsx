import ProjectList from "@/components/track/ProjectList";
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

  return <main className="zi-track-page"><section className="mx-auto max-w-5xl px-6 py-12"><Link href="/explore" className="text-sm zi-back-link">← All tracks</Link><div className="mt-8 flex flex-col gap-6 border-b border-slate-600 pb-10 md:flex-row md:items-end md:justify-between"><div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs capitalize text-cyan-300">{track.level}</span><h1 className="mt-4 text-4xl font-bold">{track.title}</h1><p className="mt-4 max-w-2xl text-slate-300">{track.description}</p></div>{enrollment ? <Link href={`/dashboard/tracks/${track.id}`} className="rounded-lg border border-emerald-400/30 px-5 py-3 text-center font-medium text-emerald-300">Go to Dashboard</Link> : user ? <EnrollButton trackId={track.id} /> : <Link href={`/auth/signin?next=/explore/${track.id}`} className="rounded-lg bg-cyan-500 px-5 py-3 text-center font-medium text-slate-950">Sign in to enroll</Link>}</div><div className="mt-10"><h2 className="text-2xl font-bold">Projects in this track</h2><p className="mt-2 text-sm text-slate-300">{projects.length} projects, including advanced platform builds</p><div className="mt-6"><ProjectList projects={projects} /></div></div></section></main>;
}
