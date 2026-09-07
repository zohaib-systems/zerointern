import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Zap } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  status?: string;
  index?: number;
  href?: string;
  isLocked?: boolean;
}

export default function ProjectCard({ project, status = "Not Started", index = project.projectOrder, href, isLocked = false }: ProjectCardProps) {
  const approved = status === "Approved";
  const advanced = project.difficultyLevel === "advanced";
  const statusClass = approved ? "approved" : status === "Submitted" || isLocked ? "pending" : status === "Rejected" ? "rejected" : "neutral";
  const action = approved ? "Review completed project" : status === "Rejected" ? "Update submission" : status === "Submitted" ? "View submission" : "Start project";

  return (
    <article className={`zi-project-card ${advanced ? "advanced" : "beginner"} ${isLocked ? "locked" : ""}`}>
      <div className="zi-card-header">
        <div className="zi-card-badges">
          <span className={`zi-badge ${advanced ? "advanced" : "beginner"}`}>{project.difficultyLevel}</span>
          <span className={`zi-badge ${statusClass}`}>
            {approved && <CheckCircle2 size={13} aria-hidden="true" />}
            {isLocked && <LockKeyhole size={13} aria-hidden="true" />}
            {isLocked ? "Locked" : status}
          </span>
          <span className="zi-project-number">Project {index}</span>
        </div>
        {project.platformName && <p className="zi-platform">{project.platformName}</p>}
        <h3 className="zi-card-title">{project.title}</h3>
      </div>
      <div className="zi-card-body">
        <p className="zi-card-description">{project.description}</p>
        {project.estimatedHours != null && project.estimatedHours > 0 && (
          <div className="zi-card-stats">
            <span><Clock3 size={15} aria-hidden="true" />{Math.ceil(project.estimatedHours / 40)} weeks at 40h/wk</span>
            <span><Zap size={15} aria-hidden="true" />{project.estimatedHours} hours</span>
          </div>
        )}
        <div className="zi-concepts" aria-label="Key concepts">
          {project.concepts.slice(0, 4).map((concept) => <span key={concept}>{concept}</span>)}
          {project.concepts.length > 4 && <span>+{project.concepts.length - 4} more</span>}
        </div>
      </div>
      <div className="zi-card-footer">
        {isLocked ? (
          <div className="zi-locked-message"><LockKeyhole size={16} aria-hidden="true" /><span>Complete beginner projects first</span></div>
        ) : href ? (
          <Link href={href} className={`zi-card-action ${approved ? "completed" : "primary"}`} aria-label={`${action}: ${project.title}`}>
            {approved && <CheckCircle2 size={16} aria-hidden="true" />}{action}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : <p className="zi-card-preview">Project brief available after enrollment</p>}
      </div>
    </article>
  );
}
