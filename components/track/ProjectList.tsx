import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";
import TrackSectionHeader from "./TrackSectionHeader";

interface ProjectListProps {
  projects: Project[];
  hrefPrefix?: string;
}

export default function ProjectList({ projects, hrefPrefix }: ProjectListProps) {
  return (
    <div>
      {(["beginner", "advanced"] as const).map((level) => {
        const sectionProjects = projects.filter((project) => project.difficultyLevel === level).sort((a, b) => a.projectOrder - b.projectOrder);
        return <section key={level} className="zi-project-section">
          <TrackSectionHeader level={level} count={sectionProjects.length} description={level === "beginner" ? "Build the foundation before taking on platform-scale systems." : "Complete all beginner projects to unlock advanced projects in your dashboard."} />
          <div className="zi-project-grid">{sectionProjects.map((project) => <ProjectCard key={project.id} project={project} href={hrefPrefix ? `${hrefPrefix}/${project.id}` : undefined} />)}</div>
        </section>;
      })}
    </div>
  );
}
