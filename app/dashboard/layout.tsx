import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import DashboardNav from "@/components/common/DashboardNav";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingProfile } from "@/lib/onboarding-server";
export default async function DashboardLayout({children}: {children: React.ReactNode}) {
 const user = await getUser();
 if (!user) redirect("/auth/signin");
 const profile = await getOnboardingProfile(await createClient(), user.id);
 if (!profile.onboarding_completed || !profile.active_track_id) redirect("/onboarding");
 return <div className="zi-dashboard-shell"><DashboardNav /><div className="zi-dashboard-content">{children}</div></div>;
}
