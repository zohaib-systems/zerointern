import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getAdminSubmission } from "@/lib/submissionAdmin";
import SubmissionList from "@/components/admin/SubmissionList";

const pageSize = 10;

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/auth/admin-login");

  const query = await searchParams;
  const certificatesView = query.status?.toLowerCase() === "certificates";
  const status = ["PENDING", "APPROVED", "REJECTED"].includes((query.status ?? "").toUpperCase())
    ? (query.status ?? "").toUpperCase()
    : "";
  const parsedPage = Number(query.page ?? "1");
  const page = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
  const { count: issuedCertificateCount } = await supabase.from("certificates").select("id", { count: "exact", head: true });

  if (certificatesView) {
    const { data: rows, error } = await supabase
      .from("certificates")
      .select("id, user_id, track_id, issued_at, verification_code")
      .order("issued_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const certificates = rows ?? [];
    const userIds = [...new Set(certificates.map((certificate) => certificate.user_id))];
    const trackIds = [...new Set(certificates.map((certificate) => certificate.track_id))];
    const [{ data: users }, { data: tracks }] = await Promise.all([
      userIds.length ? supabase.from("users").select("id, name, email").in("id", userIds) : Promise.resolve({ data: [] }),
      trackIds.length ? supabase.from("tracks").select("id, title").in("id", trackIds) : Promise.resolve({ data: [] }),
    ]);
    const userById = new Map((users ?? []).map((user) => [user.id, user]));
    const trackById = new Map((tracks ?? []).map((track) => [track.id, track]));
    const totalPages = Math.max(1, Math.ceil((issuedCertificateCount ?? 0) / pageSize));
    const certificatePageLink = (nextPage: number) => `/admin/submissions?status=certificates&page=${nextPage}`;

    return <main className="min-h-screen bg-slate-900 text-white"><section className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/admin" className="text-sm text-cyan-300">← Admin dashboard</Link>
      <h1 className="mt-8 text-4xl font-bold">All submissions</h1>
      <div className="mt-6 flex flex-wrap gap-2">{["", "pending", "approved", "rejected", "certificates"].map((filter) => <Link key={filter || "all"} href={`/admin/submissions${filter ? `?status=${filter}` : ""}`} className={`rounded-full px-3 py-1.5 text-sm ${(certificatesView ? filter === "certificates" : status.toLowerCase() === filter) ? "bg-cyan-500 text-slate-950" : "border border-slate-600 text-slate-300"}`}>{filter || "all"}{filter === "certificates" ? ` (${issuedCertificateCount ?? 0})` : ""}</Link>)}</div>
      <div className="mt-6">
        {error ? <p className="rounded-xl border border-rose-400/40 p-6 text-rose-200">Unable to load issued certificates.</p> : certificates.length === 0 ? <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-300">No certificates have been issued yet.</p> : <div className="overflow-x-auto rounded-xl border border-slate-600"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-800 text-slate-300"><tr>{["Student", "Track", "Issued", "Credential ID", "Preview"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>{certificates.map((certificate) => { const user = userById.get(certificate.user_id); const track = trackById.get(certificate.track_id); return <tr key={certificate.id} className="border-t border-slate-600 hover:bg-white/[0.03]"><td className="px-4 py-4">{user?.name ?? "Unnamed"}<br /><span className="text-xs text-slate-400">{user?.email ?? "Email unavailable"}</span></td><td className="px-4 py-4">{track?.title ?? "Track unavailable"}</td><td className="px-4 py-4 text-slate-300">{new Date(certificate.issued_at).toLocaleDateString()}</td><td className="px-4 py-4"><code>{certificate.verification_code}</code></td><td className="px-4 py-4"><a href={`/api/certificates/download?code=${encodeURIComponent(certificate.verification_code)}&preview=true`} target="_blank" rel="noreferrer" className="text-cyan-300">Preview PDF ↗</a></td></tr>; })}</tbody></table></div>}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm"><Link href={page > 1 ? certificatePageLink(page - 1) : "#"} className={page > 1 ? "text-cyan-300" : "pointer-events-none text-zinc-600"}>Previous</Link><span className="text-slate-300">Page {page} of {totalPages} · {issuedCertificateCount ?? 0} certificates issued</span><Link href={page < totalPages ? certificatePageLink(page + 1) : "#"} className={page < totalPages ? "text-cyan-300" : "pointer-events-none text-zinc-600"}>Next</Link></div>
    </section></main>;
  }

  let request = supabase.from("submissions").select("id", { count: "exact" });
  if (status) request = request.eq("status", status);
  const { data: rows, count } = await request.order("submitted_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const submissions = [];
  for (const row of rows ?? []) {
    const result = await getAdminSubmission(row.id);
    if (result.submission) submissions.push(result.submission);
  }
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const submissionPageLink = (nextPage: number) => `/admin/submissions?${status ? `status=${status.toLowerCase()}&` : ""}page=${nextPage}`;

  return <main className="min-h-screen bg-slate-900 text-white"><section className="mx-auto max-w-6xl px-6 py-12"><Link href="/admin" className="text-sm text-cyan-300">← Admin dashboard</Link><h1 className="mt-8 text-4xl font-bold">All submissions</h1><div className="mt-6 flex flex-wrap gap-2">{["", "pending", "approved", "rejected", "certificates"].map((filter) => <Link key={filter || "all"} href={`/admin/submissions${filter ? `?status=${filter}` : ""}`} className={`rounded-full px-3 py-1.5 text-sm ${status.toLowerCase() === filter ? "bg-cyan-500 text-slate-950" : "border border-slate-600 text-slate-300"}`}>{filter || "all"}{filter === "certificates" ? ` (${issuedCertificateCount ?? 0})` : ""}</Link>)}</div><div className="mt-6"><SubmissionList submissions={submissions} /></div><div className="mt-5 flex items-center justify-between text-sm"><Link href={page > 1 ? submissionPageLink(page - 1) : "#"} className={page > 1 ? "text-cyan-300" : "pointer-events-none text-zinc-600"}>Previous</Link><span className="text-slate-300">Page {page} of {totalPages}</span><Link href={page < totalPages ? submissionPageLink(page + 1) : "#"} className={page < totalPages ? "text-cyan-300" : "pointer-events-none text-zinc-600"}>Next</Link></div></section></main>;
}
