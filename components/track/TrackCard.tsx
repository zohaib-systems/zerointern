import Link from "next/link";
import type { Track } from "@/types";

interface TrackCardProps {
  track: Track;
  isEnrolled?: boolean;
  projectCount?: number;
  onEnroll?: () => void;
}

const levelStyles: Record<Track["level"], string> = {
  beginner: "bg-emerald-400/10 text-emerald-300",
  intermediate: "bg-amber-400/10 text-amber-300",
  advanced: "bg-rose-400/10 text-rose-300",
};

export default function TrackCard({ track, isEnrolled = false, projectCount = 4 }: TrackCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{track.title}</h2>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${levelStyles[track.level]}`}>{track.level}</span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-zinc-400">{track.description}</p>
      <p className="mt-5 text-sm text-zinc-500">{projectCount} projects</p>
      {isEnrolled ? (
        <Link href={`/dashboard/tracks/${track.id}`} className="mt-5 block rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-center text-sm font-medium text-emerald-300">Enrolled ✓</Link>
      ) : (
        <Link href={`/explore/${track.id}`} className="mt-5 block rounded-lg bg-cyan-500 px-4 py-2.5 text-center text-sm font-medium text-slate-950">View Track</Link>
      )}
    </article>
  );
}
