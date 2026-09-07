import { LockKeyhole } from "lucide-react";

export default function TrackSectionHeader({ level, count, locked = false, description }: {
  level: "beginner" | "advanced";
  count: number;
  locked?: boolean;
  description: string;
}) {
  return (
    <header className={`zi-section-header ${level}`}>
      <div className="zi-section-title-row">
        <span className="zi-section-indicator" aria-hidden="true" />
        <h2>{level === "beginner" ? "Beginner Level" : "Advanced Level"}</h2>
        <span className="zi-section-count">{count} Projects</span>
        {locked && <span className="zi-section-lock"><LockKeyhole size={14} aria-hidden="true" />Locked</span>}
      </div>
      <p>{description}</p>
    </header>
  );
}
