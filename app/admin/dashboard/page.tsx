import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await checkAdmin();
  if (!admin) redirect("/auth/admin-login");
  redirect("/admin");
}
