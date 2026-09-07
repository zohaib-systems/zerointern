import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingProfile } from "@/lib/onboarding-server";
import DashboardTrackContent from "@/components/track/DashboardTrackContent";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const profile = await getOnboardingProfile(await createClient(), user.id);
  if (!profile.onboarding_completed || !profile.active_track_id) redirect("/onboarding");
  return <DashboardTrackContent trackId={profile.active_track_id} isDashboard />;
}
