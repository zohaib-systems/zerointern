import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import type { Track } from "@/types";
interface TrackCardProps { track: Track; isEnrolled?: boolean; projectCount?: number; onEnroll?: () => void; previewProjects?: {id: string; title: string; difficulty_level: string}[]; }
export default function TrackCard({track,isEnrolled=false,projectCount,previewProjects=[]}: TrackCardProps) {
 return <article className="zi-panel zi-track-summary"><div className="zi-track-summary-heading"><Code2 aria-hidden="true" size={24} /><h2>{track.title}</h2></div><p>{track.description}</p>{previewProjects.length>0 && <ul className="zi-track-preview-list">{previewProjects.map(project=><li key={project.id}><span className={project.difficulty_level === "advanced" ? "advanced" : "beginner"} aria-hidden="true" />{project.title}</li>)}</ul>}<p className="zi-caption">{projectCount != null ? `${projectCount} guided projects` : "Beginner and advanced projects"}</p><Link href={isEnrolled ? `/dashboard/tracks/${track.id}` : `/explore/${track.id}`} className={`zi-btn ${isEnrolled ? "zi-btn-secondary" : "zi-btn-primary"}`}>{isEnrolled ? "Continue track" : "Explore track"}<ArrowRight size={16} aria-hidden="true" /></Link></article>;
}
