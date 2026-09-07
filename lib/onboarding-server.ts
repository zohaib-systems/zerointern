import { createClient } from "@/lib/supabase/server";
import { getRecommendation, quizSchema, recommendedSlug, trackSlugs, type TrackChoice } from "@/lib/onboarding";

type Client = Awaited<ReturnType<typeof createClient>>;
export async function getOnboardingProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("users").select("onboarding_completed, active_track_id").eq("id", userId).maybeSingle();
  if (error || !data) throw new Error("Unable to load onboarding status. Please try again.");
  return data as { onboarding_completed: boolean; active_track_id: string | null };
}
export async function getTrackChoices(supabase: Client): Promise<TrackChoice[]> {
  const { data, error } = await supabase.from("tracks").select("id, slug, title, description, projects(id)").in("slug", [...trackSlugs]).order("title");
  if (error) throw new Error("Unable to load tracks. Please try again.");
  return (data ?? []).map(track => ({ id: track.id, slug: track.slug, title: track.title, description: track.description, projects: track.projects?.length ?? 0 }));
}
export async function getSavedRecommendation(supabase: Client, userId: string, tracks: TrackChoice[]) {
  const { data, error } = await supabase.from("onboarding_responses").select("experience_level, goal, timeline, quiz_completed").eq("user_id", userId).maybeSingle();
  if (error) throw new Error("Unable to load your saved answers. Please try again.");
  const parsed = quizSchema.safeParse(data);
  return {
    quizCompleted: Boolean(data?.quiz_completed && parsed.success),
    userAnswers: parsed.success ? parsed.data : null,
    recommendation: data?.quiz_completed && parsed.success && tracks.some(track => track.slug === recommendedSlug(parsed.data)) ? getRecommendation(parsed.data, tracks) : null,
  };
}
