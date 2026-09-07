import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackSelectionSchema } from "@/lib/onboarding";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await request.json().catch(() => null);
    const parsed = trackSelectionSchema.safeParse({ track_id: body?.trackId });
    if (!parsed.success) return NextResponse.json({ error: "A valid trackId is required" }, { status: 400 });
    const { error } = await supabase.rpc("select_onboarding_track", { p_track_id: parsed.data.track_id });
    if (error) return NextResponse.json({ error: error.code === "P0002" ? "Track or profile not found" : "Unable to enroll in track" }, { status: error.code === "P0002" ? 404 : 500 });
    return NextResponse.json({ data: { enrolled: true } });
  } catch { return NextResponse.json({ error: "Unable to enroll in track" }, { status: 500 }); }
}
