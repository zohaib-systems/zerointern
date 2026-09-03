import { redirect } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { checkAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await checkAdmin();
  if (!admin) redirect("/auth/admin-login");

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Administration</p>
        <h1 className="mt-3 text-4xl font-bold">Admin dashboard</h1>
        <p className="mt-4 text-zinc-400">Manage tracks, projects, and submissions from here.</p>
      </section>
    </main>
  );
}
