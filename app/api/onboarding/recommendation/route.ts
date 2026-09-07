import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSavedRecommendation, getTrackChoices } from "@/lib/onboarding-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your recommendation" }, { status: 401 });
    return NextResponse.json(await getSavedRecommendation(supabase, user.id, await getTrackChoices(supabase)), { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Unable to load your recommendation. Please try again." }, { status: 500 }); }
}
