import { checkProjectAccess } from "@/lib/projectAccess";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { mapProject } from "@/lib/data";
import SubmissionForm from "@/components/project/SubmissionForm";
import SubmissionStatus from "@/components/project/SubmissionStatus";

export default async function DashboardProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const { projectId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (error || !data) notFound();
  const access = await checkProjectAccess(supabase, user.id, data);
  if (access) redirect(`/dashboard/tracks/${data.track_id}`);
  const project = mapProject(data as unknown as Record<string, unknown>);
  const { data: submissionRow } = await supabase.from("submissions").select("*").eq("user_id", user.id).eq("project_id", projectId).maybeSingle();
  const submission = submissionRow ? { id: submissionRow.id, userId: submissionRow.user_id, projectId: submissionRow.project_id, repoUrl: submissionRow.repo_url, liveUrl: submissionRow.live_url, status: submissionRow.status, adminNotes: submissionRow.admin_notes, submittedAt: submissionRow.submitted_at, approvedAt: submissionRow.approved_at, createdAt: submissionRow.created_at, updatedAt: submissionRow.updated_at } : null;
  return <main className="zi-container zi-page">
    <Link href={`/dashboard/tracks/${project.trackId}`} className="zi-back-link">&larr; Back to track</Link>
    <header className="zi-project-detail-header"><div className="zi-card-badges"><span className={`zi-badge ${project.difficultyLevel}`}>{project.difficultyLevel}</span>{project.platformName && <span className="zi-badge neutral">{project.platformName}</span>}<span className="zi-caption">Project {project.projectOrder}</span></div><h1>{project.title}</h1><p className="zi-lead">{project.description}</p>{project.estimatedHours && <div className="zi-quick-stats"><span>{Math.ceil(project.estimatedHours/40)} weeks at 40 hours/week</span><span>{project.estimatedHours} estimated hours</span></div>}</header>
    <div className="zi-detail-grid"><div className="zi-stack">
      <section className="zi-panel"><h2>The business problem</h2><p>{project.problem || project.description}</p></section>
      <section className="zi-panel"><h2>What you&apos;ll build</h2><p className="whitespace-pre-wrap">{project.brief}</p></section>
      {project.skillsLearned.length>0 && <section className="zi-panel"><h2>Skills you&apos;ll learn</h2><ul className="zi-skills-grid">{project.skillsLearned.map(skill=><li key={skill}>{skill}</li>)}</ul></section>}
      {project.realWorldValue && <section className="zi-panel"><h2>Real-world value</h2><p>{project.realWorldValue}</p></section>}
      <section className="zi-panel"><h2>Recommended resources</h2><div className="zi-stack">{project.resources.map(resource=><a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="zi-resource"><span>{resource.type}</span><strong>{resource.title}</strong><span aria-hidden="true">&nearr;</span></a>)}</div></section>
      <section id="submission" className="zi-submission-section"><h2 className="zi-subheading">Submit your project</h2>{submission ? <><SubmissionStatus submission={submission} />{submission.status === "REJECTED" && <div className="mt-6"><SubmissionForm projectId={project.id} initialRepoUrl={submission.repoUrl} initialLiveUrl={submission.liveUrl} /></div>}</> : <SubmissionForm projectId={project.id} />}</section>
    </div><aside className="zi-detail-sidebar"><div className="zi-panel"><h2>Ready to build?</h2><h3>Prerequisites</h3>{project.prerequisites.length ? <ul className="zi-list">{project.prerequisites.map(item=><li key={item}>{item}</li>)}</ul> : <p>Use the project brief and resources to guide your first implementation.</p>}<a href="#submission" className="zi-btn zi-btn-primary">{submission ? "View submission" : "Submit your work"}</a></div><div className="zi-panel"><h2>Concepts covered</h2><div className="zi-concepts">{project.concepts.map(concept=><span key={concept}>{concept}</span>)}</div></div><div className="zi-panel"><h2>Before you submit</h2><ul className="zi-list"><li>Make your repository accessible to reviewers.</li><li>Include a README with setup instructions.</li><li>Test the live application and its core flows.</li></ul></div></aside></div>
  </main>;
}
