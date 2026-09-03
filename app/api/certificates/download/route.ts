import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getCertificateData } from "@/lib/certificateData";
import { createCertificatePDF } from "@/lib/certificatePdf";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Certificate code is required" }, { status: 400 });
  const supabase = createServiceClient();
  const data = await getCertificateData(supabase, code, user.id);
  if (!data) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  const { data: certificate } = await supabase.from("certificates").select("download_count").eq("id", data.id).single();
  await supabase.from("certificates").update({ download_count: (certificate?.download_count ?? 0) + 1, updated_at: new Date().toISOString() }).eq("id", data.id);
  const origin = new URL(request.url).origin;
  const pdf = await createCertificatePDF(data, `${origin}/certificate/verify/${encodeURIComponent(data.verificationCode)}`);
  const disposition = new URL(request.url).searchParams.get("preview") === "true" ? "inline" : "attachment";
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename="${data.credentialId}.pdf"`, "Cache-Control": "no-store" } });
}
