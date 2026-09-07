import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingProfile, getSavedRecommendation, getTrackChoices } from "@/lib/onboarding-server";
import OnboardingQuiz from "@/components/onboarding/OnboardingQuiz";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ switch?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const supabase = await createClient();
  const profile = await getOnboardingProfile(supabase, user.id);
  const switching = (await searchParams).switch === "1" && profile.onboarding_completed;
  if (profile.onboarding_completed && profile.active_track_id && !switching) redirect("/dashboard");
  const tracks = await getTrackChoices(supabase);
  const saved = await getSavedRecommendation(supabase, user.id, tracks);
  return <OnboardingQuiz user={{ name: user.user_metadata.full_name ?? user.user_metadata.name ?? "", email: user.email ?? "", image: user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null }} tracks={tracks} initialAnswers={saved.userAnswers} initialRecommendation={saved.recommendation} switching={switching} activeTrackId={profile.active_track_id} />;
}
