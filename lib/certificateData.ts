import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateData } from "./certificate";

export async function getCertificateData(supabase: SupabaseClient, code: string, userId?: string): Promise<CertificateData | null> {
  let query = supabase.from("certificates").select("*").eq("verification_code", code);
  if (userId) query = query.eq("user_id", userId);
  const { data: certificate } = await query.maybeSingle();
  if (!certificate) return null;

  const [{ data: user }, { data: track }, { data: approved }] = await Promise.all([
    supabase.from("users").select("name, email").eq("id", certificate.user_id).maybeSingle(),
    supabase.from("tracks").select("title").eq("id", certificate.track_id).maybeSingle(),
    supabase.from("submissions").select("project_id, repo_url, live_url").eq("user_id", certificate.user_id).eq("status", "APPROVED"),
  ]);
  if (!track || !approved) return null;

  const projectIds = approved.map((submission) => submission.project_id);
  const { data: projects } = await supabase.from("projects").select("id, title, project_order").eq("track_id", certificate.track_id).in("id", projectIds).order("project_order", { ascending: true });
  if (!projects || projects.length < 4) return null;

  const submissionByProject = new Map(approved.map((submission) => [submission.project_id, submission]));
  return {
    id: certificate.id,
    credentialId: certificate.verification_code,
    studentName: user?.name ?? user?.email ?? "ZeroIntern learner",
    trackName: track.title,
    issuedAt: certificate.issued_at,
    cryptoHash: certificate.crypto_hash,
    verificationCode: certificate.verification_code,
    projects: projects.map((project) => ({ title: project.title, projectOrder: project.project_order, repoUrl: submissionByProject.get(project.id)?.repo_url ?? "", liveUrl: submissionByProject.get(project.id)?.live_url ?? "" })),
  };
}
