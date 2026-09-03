interface ComingSoonCardProps {
  title: string;
  slug: string;
}

export default function ComingSoonCard({ title, slug }: ComingSoonCardProps) {
  return <article aria-label={`${title}, coming soon`} className="flex h-full flex-col rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 opacity-80"><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold text-zinc-300">{title}</h2><span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">Coming soon</span></div><p className="mt-4 flex-1 text-sm leading-6 text-zinc-500">A guided {slug.replaceAll("-", " ")} track is being prepared.</p><span className="mt-5 min-h-12 rounded-lg border border-white/10 px-4 py-3 text-center text-sm text-zinc-500">Join the next phase</span></article>;
}
