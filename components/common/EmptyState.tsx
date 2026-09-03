import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLink?: string;
  actionLabel?: string;
}

export default function EmptyState({ title, description, actionLink, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-zinc-400">{description}</p>
      {actionLink && actionLabel && <Link href={actionLink} className="mt-6 inline-block rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950">{actionLabel}</Link>}
    </div>
  );
}
