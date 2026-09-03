import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  hrefPrefix?: string;
}

export default function ProjectList({ projects, hrefPrefix }: ProjectListProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-400">{projects.length}/4 projects available</p>
      <div className="grid gap-5 md:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project} href={hrefPrefix ? `${hrefPrefix}/${project.id}` : undefined} />)}</div>
    </div>
  );
}
