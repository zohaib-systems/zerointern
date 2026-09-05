import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateData } from "./certificate";
import { generateCryptoHash } from "./certificate";

export interface PublicCertificateData extends CertificateData {
  status: "verified" | "revoked" | "expired";
  integrityValid: boolean;
  revokedAt: string | null;
  revocationReason: string | null;
  expiresAt: string | null;
}

export async function getCertificateData(supabase: SupabaseClient, code: string, userId?: string): Promise<PublicCertificateData | null> {
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
  const { data: projects } = projectIds.length
    ? await supabase
        .from("projects")
        .select("id, title, project_order")
        .eq("track_id", certificate.track_id)
        .in("id", projectIds)
        .order("project_order", { ascending: true })
    : { data: [] };
  if (!projects) return null;

  const actualHash = generateCryptoHash(
    certificate.user_id,
    certificate.track_id,
    certificate.issued_at
  );
  const storedHash = typeof certificate.crypto_hash === "string"
    ? certificate.crypto_hash.toLowerCase()
    : "";
  const integrityValid = storedHash.length === actualHash.length && storedHash === actualHash;
  const revokedAt = typeof certificate.revoked_at === "string" ? certificate.revoked_at : null;
  const expiresAt = typeof certificate.expires_at === "string" ? certificate.expires_at : null;
  const statusValue = typeof certificate.status === "string" ? certificate.status.toLowerCase() : "";
  const status = statusValue === "revoked" || revokedAt
    ? "revoked"
    : statusValue === "expired" || (expiresAt && new Date(expiresAt).getTime() <= Date.now())
      ? "expired"
      : "verified";

  const submissionByProject = new Map(approved.map((submission) => [submission.project_id, submission]));
  return {
    id: certificate.id,
    credentialId: certificate.verification_code,
    studentName: user?.name ?? user?.email ?? "ZeroIntern learner",
    trackName: track.title,
    issuedAt: certificate.issued_at,
    cryptoHash: certificate.crypto_hash,
    verificationCode: certificate.verification_code,
    status,
    integrityValid,
    revokedAt,
    revocationReason: typeof certificate.revocation_reason === "string" ? certificate.revocation_reason : null,
    expiresAt,
    projects: projects.map((project) => ({ title: project.title, projectOrder: project.project_order, repoUrl: submissionByProject.get(project.id)?.repo_url ?? "", liveUrl: submissionByProject.get(project.id)?.live_url ?? "" })),
  };
}
