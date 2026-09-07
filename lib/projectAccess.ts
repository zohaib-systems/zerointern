import type { SupabaseClient } from "@supabase/supabase-js";

export function beginnerProgress(projects: { id: string; difficultyLevel: string }[], approvedIds: Iterable<string>) {
  const approved = new Set(approvedIds);
  const beginners = projects.filter((project) => project.difficultyLevel === "beginner");
  const missingCount = beginners.filter((project) => !approved.has(project.id)).length;
  return { advancedUnlocked: beginners.length > 0 && missingCount === 0, missingCount };
}

export async function checkProjectAccess(supabase: SupabaseClient, userId: string, project: { track_id: string; difficulty_level?: string }) {
  const { data: enrollment, error } = await supabase.from("track_enrollments").select("id").eq("user_id", userId).eq("track_id", project.track_id).maybeSingle();
  if (error) throw new Error("Unable to verify enrollment");
  if (!enrollment) return { error: "Enroll in this track first", missingCount: 0 };
  if (project.difficulty_level !== "advanced") return null;
  const { data: projects, error: projectsError } = await supabase.from("projects").select("id, difficulty_level").eq("track_id", project.track_id).eq("difficulty_level", "beginner");
  if (projectsError || !projects) throw new Error("Unable to verify prerequisites");
  if (!projects.length) return { error: "Beginner projects are not configured", missingCount: 0 };
  const { data: submissions, error: submissionsError } = await supabase.from("submissions").select("project_id").eq("user_id", userId).eq("status", "APPROVED").in("project_id", projects.map((project) => project.id));
  if (submissionsError) throw new Error("Unable to verify completed projects");
  const progress = beginnerProgress(projects.map((project) => ({ id: project.id, difficultyLevel: project.difficulty_level })), (submissions ?? []).map((submission) => submission.project_id));
  return progress.advancedUnlocked ? null : { error: "Complete all beginner projects first", missingCount: progress.missingCount };
}
