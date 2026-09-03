import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCertificateData } from "@/lib/certificateData";

export default async function CertificatesPage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  const supabase = await createClient();
  const { data: certificates } = await supabase.from("certificates").select("verification_code").eq("user_id", user.id).order("issued_at", { ascending: false });
  const data = (await Promise.all((certificates ?? []).map((certificate) => getCertificateData(supabase, certificate.verification_code, user.id)))).filter(Boolean);
  return <main className="min-h-screen bg-[#0b0b0f] px-6 py-12 text-white"><section className="mx-auto max-w-5xl"><Link href="/dashboard" className="text-sm text-cyan-300">← Dashboard</Link><h1 className="mt-8 text-4xl font-bold">Your certificates</h1><p className="mt-3 text-zinc-400">Verified proof of the projects you have completed.</p>{data.length ? <div className="mt-10 grid gap-6 md:grid-cols-2">{data.map((certificate) => certificate && <article key={certificate.id} className="rounded-2xl border-2 border-[#20A562]/70 bg-white p-6 text-slate-900"><div className="flex items-start justify-between gap-4"><p className="text-xs font-semibold tracking-[0.18em] text-[#16804b]">DIGITALLY VERIFIED</p><Link href={`/certificate/verify/${encodeURIComponent(certificate.verificationCode)}`} className="shrink-0 text-right text-xs font-semibold text-[#16804b] underline-offset-2 hover:underline">Verify credential</Link></div><h2 className="mt-4 text-2xl font-bold">{certificate.trackName}</h2><p className="mt-2 text-sm text-slate-500">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p><p className="mt-4 font-mono text-xs text-slate-500">SHA-256: {certificate.cryptoHash.slice(0, 18)}...{certificate.cryptoHash.slice(-12)}</p><div className="mt-6 flex flex-wrap gap-3"><a href={`/api/certificates/download?code=${encodeURIComponent(certificate.verificationCode)}`} className="rounded-lg bg-[#20A562] px-4 py-2 text-sm font-semibold text-white">Download PDF</a><a href={`/api/certificates/download?code=${encodeURIComponent(certificate.verificationCode)}&preview=true`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#20A562] px-4 py-2 text-sm font-semibold text-[#16804b]">Preview certificate</a></div></article>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-white/20 p-8 text-zinc-400">Complete and receive approval for all four projects in a track to earn a certificate.</div>}</section></main>;
}
