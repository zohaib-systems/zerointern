import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import NotificationPreferences from "@/components/settings/NotificationPreferences";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/settings/ProfileForm";
export default async function SettingsPage() {
 const user=await getUser(); if(!user) redirect("/auth/signin");
 const supabase = await createClient();
 const { data: preference, error } = await supabase.from("notification_preferences").select("email_enabled").eq("user_id", user.id).maybeSingle();
 return <main className="zi-container zi-page zi-settings"><header className="zi-page-heading"><div><p className="zi-eyebrow">Your account</p><h1>Settings</h1><p>Manage your profile and email preferences.</p></div></header><ProfileForm name={user.user_metadata.full_name ?? user.user_metadata.name ?? ""} email={user.email ?? ""} /><NotificationPreferences initialEnabled={preference?.email_enabled ?? false} loadFailed={Boolean(error)} /><section className="zi-panel zi-danger-panel"><h2>Account deletion</h2><p>Self-service account deletion is not available yet.</p></section></main>;
}
