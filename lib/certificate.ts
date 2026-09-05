import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CertificateProject {
  title: string;
  projectOrder: number;
  repoUrl: string;
  liveUrl: string;
}

export interface CertificateData {
  id: string;
  credentialId: string;
  studentName: string;
  trackName: string;
  issuedAt: string;
  cryptoHash: string;
  verificationCode: string;
  projects: CertificateProject[];
}

export function generateCryptoHash(userId: string, trackId: string, timestamp: string) {
  const canonicalTimestamp = new Date(timestamp).toISOString();
  return crypto.createHash("sha256").update(userId + trackId + canonicalTimestamp).digest("hex");
}

export function generateVerificationCode() {
  return `ZI-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function verifyCryptoHash(userId: string, trackId: string, timestamp: string, expectedHash: string) {
  const actualHash = generateCryptoHash(userId, trackId, timestamp);
  return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
}

export async function createCertificateIfEarned(supabase: SupabaseClient, userId: string, trackId: string) {
  const { data: projects } = await supabase.from("projects").select("id").eq("track_id", trackId);
  const projectIds = (projects ?? []).map((project) => project.id);
  if (projectIds.length < 4) return null;

  const { count } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "APPROVED").in("project_id", projectIds);
  if ((count ?? 0) < 4) return null;

  const { data: existing } = await supabase.from("certificates").select("id").eq("user_id", userId).eq("track_id", trackId).maybeSingle();
  if (existing) return existing;

  const issuedAt = new Date().toISOString();
  const certificate = { user_id: userId, track_id: trackId, issued_at: issuedAt, crypto_hash: generateCryptoHash(userId, trackId, issuedAt), verification_code: generateVerificationCode() };
  const { data, error } = await supabase.from("certificates").insert(certificate).select("id").single();
  if (error) throw error;
  return data;
}
