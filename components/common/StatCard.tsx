interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return <article className="rounded-xl border border-slate-600 bg-slate-800 p-5"><p className="text-sm text-slate-300">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p>{detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}</article>;
}
