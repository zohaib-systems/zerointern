import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import ProfileForm from "@/components/settings/ProfileForm";
export default async function SettingsPage() {
 const user=await getUser(); if(!user) redirect("/auth/signin");
 return <main className="zi-container zi-page zi-settings"><header className="zi-page-heading"><div><p className="zi-eyebrow">Your account</p><h1>Settings</h1><p>Manage how your name appears across ZeroIntern.</p></div></header><ProfileForm name={user.user_metadata.full_name ?? user.user_metadata.name ?? ""} email={user.email ?? ""} /><section className="zi-panel"><h2>Preferences</h2><div className="zi-setting-row"><div><h3>Email notifications</h3><p>Approval updates are available on your project page. Email delivery is not available yet.</p></div><span className="zi-badge neutral">Coming soon</span></div><div className="zi-setting-row"><div><h3>Marketing emails</h3><p>No marketing email subscription is currently offered.</p></div><span className="zi-badge neutral">Unavailable</span></div></section><section className="zi-panel zi-danger-panel"><h2>Account deletion</h2><p>Self-service account deletion is not available yet.</p></section></main>;
}
