import { redirect } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapTrack } from "@/lib/data";
import ProgressBar from "@/components/track/ProgressBar";
import EmptyState from "@/components/common/EmptyState";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const supabase = await createClient();
  const { data: enrollments, error } = await supabase.from("track_enrollments").select("track_id").eq("user_id", user.id);
  if (error) return <main className="min-h-screen bg-[#0b0b0f] px-6 py-16 text-white"><p className="text-rose-300">Unable to load your tracks.</p></main>;
  const enrolledIds = (enrollments ?? []).map((enrollment) => enrollment.track_id);
  const { data: tracks } = enrolledIds.length ? await supabase.from("tracks").select("*").in("id", enrolledIds) : { data: [] };
  const enrolledTracks = (tracks ?? []).map((track) => mapTrack(track));
  const { data: submissions } = enrolledIds.length ? await supabase.from("submissions").select("project_id, status").eq("user_id", user.id).eq("status", "APPROVED") : { data: [] };
  const completedByTrack = new Map<string, number>();
  if (submissions?.length) {
    const { data: projects } = await supabase.from("projects").select("track_id").in("track_id", enrolledIds).in("id", submissions.map((submission) => submission.project_id));
    for (const project of projects ?? []) completedByTrack.set(project.track_id, (completedByTrack.get(project.track_id) ?? 0) + 1);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold">Welcome, {user.user_metadata.name ?? user.email}.</h1>
        <p className="mt-4 text-zinc-400">Keep building momentum across your enrolled tracks.</p><a href="/dashboard/certificates" className="mt-5 inline-block rounded-lg border border-[#20A562] px-4 py-2 text-sm font-medium text-[#65d69a]">View Certificates</a>
        <div className="mt-10">{enrolledTracks.length ? <div className="grid gap-5 md:grid-cols-2">{enrolledTracks.map((track) => { const completed = completedByTrack.get(track.id) ?? 0; return <article key={track.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold">{track.title}</h2><span className="text-sm text-zinc-400">{completed}/4</span></div><div className="mt-5"><ProgressBar completed={completed} total={4} /></div><a href={`/dashboard/tracks/${track.id}`} className="mt-5 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">View Track</a></article>; })}</div> : <EmptyState title="Start learning" description="You have not enrolled in a track yet. Choose a path and start building." actionLink="/explore" actionLabel="Explore Tracks" />}</div>
      </section>
    </main>
  );
}
