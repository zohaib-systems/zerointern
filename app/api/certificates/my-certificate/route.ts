import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCertificateData } from "@/lib/certificateData";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const supabase = await createClient();
  const { data: certificates, error } = await supabase.from("certificates").select("verification_code").eq("user_id", user.id).order("issued_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const data = (await Promise.all((certificates ?? []).map((certificate) => getCertificateData(supabase, certificate.verification_code, user.id)))).filter(Boolean);
  return NextResponse.json({ data });
}
