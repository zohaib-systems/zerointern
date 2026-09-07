import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackSelectionSchema } from "@/lib/onboarding";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to select a track" }, { status: 401 });
    const parsed = trackSelectionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Choose a valid track" }, { status: 400 });
    const { error } = await supabase.rpc("select_onboarding_track", { p_track_id: parsed.data.track_id });
    if (error) return NextResponse.json({ error: error.code === "P0002" ? "Track or profile not found. Please refresh and try again." : "Unable to select your track. Please try again." }, { status: error.code === "P0002" ? 404 : 500 });
    return NextResponse.json({ success: true, message: "Track selected successfully", redirectTo: "/dashboard" });
  } catch { return NextResponse.json({ error: "Unable to select your track. Please try again." }, { status: 500 }); }
}
