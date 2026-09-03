import type { Project, Track } from "@/types";

export function mapTrack(row: Record<string, unknown>): Track {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: String(row.description),
    level: row.level as Track["level"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    trackId: String(row.track_id),
    title: String(row.title),
    description: String(row.description),
    problem: String(row.problem ?? ""),
    brief: String(row.brief),
    resources: Array.isArray(row.resources) ? row.resources as Project["resources"] : [],
    concepts: Array.isArray(row.concepts) ? row.concepts.map(String) : [],
    projectOrder: Number(row.project_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
