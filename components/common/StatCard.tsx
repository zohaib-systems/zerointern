interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p>{detail && <p className="mt-1 text-xs text-zinc-500">{detail}</p>}</article>;
}
