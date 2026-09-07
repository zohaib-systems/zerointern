import TrackSectionHeader from "@/components/track/TrackSectionHeader";
import { beginnerProgress } from "@/lib/projectAccess";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { mapProject, mapTrack } from "@/lib/data";
import ProjectCard from "@/components/track/ProjectCard";
import ProgressBar from "@/components/track/ProgressBar";

export default async function DashboardTrackContent({ trackId, isDashboard = false }: { trackId: string; isDashboard?: boolean }) {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const supabase = await createClient();
  const { data: enrollment } = await supabase.from("track_enrollments").select("id").eq("user_id", user.id).eq("track_id", trackId).maybeSingle();
  if (!enrollment) redirect(`/explore/${trackId}`);
  const { data, error } = await supabase.from("tracks").select("*, projects(*)").eq("id", trackId).maybeSingle();
  if (error || !data) notFound();
  const track = mapTrack(data as unknown as Record<string, unknown>);
  const projectRows = Array.isArray(data.projects) ? (data.projects as unknown[]) : [];
  const projects = projectRows.map((project) => mapProject(project as Record<string, unknown>)).sort((a, b) => a.projectOrder - b.projectOrder);
  const { data: submissions } = await supabase.from("submissions").select("project_id, status").eq("user_id", user.id).in("project_id", projects.map((project) => project.id));
  const submissionMap = new Map((submissions ?? []).map((submission) => [submission.project_id, submission.status]));
  const completed = projects.filter((project) => submissionMap.get(project.id) === "APPROVED").length;
  const beginnerProjects = projects.filter((project) => project.difficultyLevel === "beginner");
  const advancedProjects = projects.filter((project) => project.difficultyLevel === "advanced");
  const { advancedUnlocked } = beginnerProgress(projects, projects.filter((project) => submissionMap.get(project.id) === "APPROVED").map((project) => project.id));
  const percentage = projects.length ? Math.round(completed / projects.length * 100) : 0;
  const beginnerCompleted = beginnerProjects.filter((project) => submissionMap.get(project.id) === "APPROVED").length;
  const advancedCompleted = advancedProjects.filter((project) => submissionMap.get(project.id) === "APPROVED").length;
  const renderProject = (project: typeof projects[number], locked = false) => {
    const raw = submissionMap.get(project.id);
    const status = locked ? "Locked" : raw === "APPROVED" ? "Approved" : raw ? raw === "REJECTED" ? "Rejected" : "Submitted" : "Not Started";
    return <ProjectCard key={project.id} project={project} status={status} isLocked={locked} href={locked ? undefined : `/dashboard/projects/${project.id}`} />;
  };
  return (
    <main className="zi-track-page">
      <div className="zi-track-container">
        <Link href={isDashboard ? "/onboarding?switch=1" : "/dashboard"} className="zi-back-link">{isDashboard ? "Switch track" : "← Dashboard"}</Link>
        <header className="zi-track-header">
          <div>
            <p className="zi-eyebrow">Your track</p>
            <h1>{track.title}</h1>
            <p className="zi-track-description">{track.description}</p>
          </div>
          <aside aria-label="Track progress" className="zi-progress-card">
            <div className="zi-progress-header"><h2>Track progress</h2><span>{percentage}%</span></div>
            <p className="zi-progress-subtitle">{completed} of {projects.length} projects approved</p>
            <div className="zi-progress-row"><span>Beginner</span><ProgressBar completed={beginnerCompleted} total={beginnerProjects.length} variant="beginner" label="Beginner projects" /><span>{beginnerCompleted}/{beginnerProjects.length}</span></div>
            <div className="zi-progress-row"><span>Advanced</span><ProgressBar completed={advancedCompleted} total={advancedProjects.length} variant="advanced" label="Advanced projects" /><span>{advancedCompleted}/{advancedProjects.length}</span></div>
            <p className={`zi-progress-milestone ${advancedUnlocked ? "unlocked" : ""}`}>{advancedUnlocked ? "Advanced projects unlocked" : "Finish beginner projects to unlock advanced"}</p>
          </aside>
        </header>
        <section className="zi-project-section">
          <TrackSectionHeader level="beginner" count={beginnerProjects.length} description="Build the foundation before taking on platform-scale systems." />
          <div className="zi-project-grid">{beginnerProjects.map((project) => renderProject(project))}</div>
        </section>
        <section className="zi-project-section">
          <TrackSectionHeader level="advanced" count={advancedProjects.length} locked={!advancedUnlocked} description="Put your foundation to work with ambitious, real-world platform builds." />
          {!advancedUnlocked && <div className="zi-lock-notice">{beginnerProjects.length - beginnerCompleted} beginner projects remaining. All beginner submissions must be approved to unlock advanced projects.</div>}
          <div className="zi-project-grid">{advancedProjects.map((project) => renderProject(project, !advancedUnlocked))}</div>
        </section>
      </div>
    </main>
  );
}
