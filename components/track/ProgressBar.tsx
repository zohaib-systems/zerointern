interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const color = percentage === 100 ? "bg-emerald-400" : percentage > 0 ? "bg-amber-400" : "bg-zinc-600";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" aria-label={`${percentage}% complete`}>
      <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
    </div>
  );
}
