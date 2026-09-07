interface ProgressBarProps {
  completed: number;
  total: number;
  variant?: "overall" | "beginner" | "advanced";
  label?: string;
}

export default function ProgressBar({ completed, total, variant = "overall", label = "Approved projects" }: ProgressBarProps) {
  const percentage = total > 0 ? Math.max(0, Math.min(100, Math.round((completed / total) * 100))) : 0;
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="zi-progress-track" aria-label={label} aria-valuetext={`${completed} of ${total} approved, ${percentage}% complete`}>
      <div className={`zi-progress-fill ${variant}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}
