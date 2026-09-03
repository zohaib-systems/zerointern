import type { SubmissionWithDetails } from "@/types";
import { requireAdmin } from "@/lib/admin";

export async function getAdminSubmission(id: string): Promise<{ supabase: Awaited<ReturnType<typeof requireAdmin>>; submission: SubmissionWithDetails | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { supabase, submission: null };
  const { data: row } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (!row) return { supabase, submission: null };
  const [{ data: user }, { data: project }] = await Promise.all([
    supabase.from("users").select("name, email").eq("id", row.user_id).maybeSingle(),
    supabase.from("projects").select("title, track_id, project_order, problem, brief").eq("id", row.project_id).maybeSingle(),
  ]);
  const { data: track } = project ? await supabase.from("tracks").select("title").eq("id", project.track_id).maybeSingle() : { data: null };
  if (!project || !track) return { supabase, submission: null };

  const authUser = user ? null : await supabase.auth.admin.getUserById(row.user_id);
  const email = user?.email ?? authUser?.data.user?.email;
  if (!email) return { supabase, submission: null };

  return { supabase, submission: { id: row.id, userId: row.user_id, projectId: row.project_id, repoUrl: row.repo_url, liveUrl: row.live_url, status: row.status, adminNotes: row.admin_notes, submittedAt: row.submitted_at, approvedAt: row.approved_at, rejectedAt: row.rejected_at, createdAt: row.created_at, updatedAt: row.updated_at, userName: user?.name ?? authUser?.data.user?.user_metadata?.full_name ?? authUser?.data.user?.user_metadata?.name ?? null, userEmail: email, projectTitle: project.title, trackTitle: track.title, trackId: project.track_id, projectProblem: project.problem, projectBrief: project.brief } };
}
