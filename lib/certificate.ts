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
  sealLevel?: "standard" | "advanced";
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
  const { data: projects, error: projectsError } = await supabase.from("projects").select("id").eq("track_id", trackId).eq("difficulty_level", "beginner");
  if (projectsError) throw projectsError;
  const projectIds = (projects ?? []).map((project) => project.id);
  if (projectIds.length < 4) return null;

  const { data: approved, error: approvalsError } = await supabase.from("submissions").select("project_id").eq("user_id", userId).eq("status", "APPROVED").in("project_id", projectIds);
  if (approvalsError) throw approvalsError;
  if (new Set((approved ?? []).map((submission) => submission.project_id)).size < 4) return null;

  const existingQuery = () => supabase.from("certificates").select("id").eq("user_id", userId).eq("track_id", trackId).maybeSingle();
  const { data: existing, error: existingError } = await existingQuery();
  if (existingError) throw existingError;
  if (existing) return existing;

  const issuedAt = new Date().toISOString();
  const certificate = { user_id: userId, track_id: trackId, issued_at: issuedAt, crypto_hash: generateCryptoHash(userId, trackId, issuedAt), verification_code: generateVerificationCode() };
  const { data, error } = await supabase.from("certificates").insert(certificate).select("id").single();
  // Concurrent approvals may both qualify; the user/track unique key keeps one credential.
  if (error?.code === "23505") {
    const { data: concurrent, error: concurrentError } = await existingQuery();
    if (concurrentError) throw concurrentError;
    if (concurrent) return concurrent;
  }
  if (error) throw error;
  return data;
}
