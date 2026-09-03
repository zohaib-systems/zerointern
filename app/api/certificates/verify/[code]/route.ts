import { NextResponse } from "next/server";
import { getCertificateData } from "@/lib/certificateData";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getCertificateData(createServiceClient(), code);
  if (!data) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  return NextResponse.json({ data });
}
