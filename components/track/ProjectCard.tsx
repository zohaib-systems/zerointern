import Link from "next/link";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  status?: string;
  index?: number;
  href?: string;
}

export default function ProjectCard({ project, status = "Not Started", index = project.projectOrder, href }: ProjectCardProps) {
  const statusStyle = status === "Approved" ? "text-emerald-300 bg-emerald-400/10" : status === "Submitted" ? "text-amber-300 bg-amber-400/10" : "text-zinc-300 bg-white/10";
  const content = (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-400/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-cyan-300">Project {index}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle}`}>{status}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold">{project.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">{project.concepts.map((concept) => <span key={concept} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{concept}</span>)}</div>
      <p className="mt-4 text-sm text-zinc-500">{project.brief.slice(0, 100)}{project.brief.length > 100 ? "..." : ""}</p>
    </article>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}
