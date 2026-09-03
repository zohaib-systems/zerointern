import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const trackId = typeof body === "object" && body !== null && "trackId" in body ? (body as { trackId?: unknown }).trackId : undefined;
    if (typeof trackId !== "string" || !trackId.trim()) return NextResponse.json({ error: "A valid trackId is required" }, { status: 400 });

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { data: track, error: trackError } = await supabase.from("tracks").select("id").eq("id", trackId).maybeSingle();
    if (trackError) return NextResponse.json({ error: trackError.message }, { status: 500 });
    if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

    const { data: existing, error: existingError } = await supabase.from("track_enrollments").select("id").eq("user_id", userData.user.id).eq("track_id", trackId).maybeSingle();
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

    const { error: insertError } = await supabase.from("track_enrollments").insert({ user_id: userData.user.id, track_id: trackId });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json({ data: { enrolled: true } });
  } catch {
    return NextResponse.json({ error: "Unable to enroll in track" }, { status: 500 });
  }
}
