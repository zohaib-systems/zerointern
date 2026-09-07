import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { quizSchema, getRecommendation } from "@/lib/onboarding";
import { getTrackChoices } from "@/lib/onboarding-server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to save your answers" }, { status: 401 });
    const parsed = quizSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please answer all four questions with a valid option" }, { status: 400 });
    const recommendation = getRecommendation(parsed.data, await getTrackChoices(supabase));
    const now = new Date().toISOString();
    const { error } = await supabase.from("onboarding_responses").upsert({
      user_id: user.id, ...parsed.data, recommended_track_id: recommendation.recommendedTrackId,
      recommended_track_name: recommendation.recommendedTrackName, recommendation_reason: recommendation.reason,
      quiz_completed: true, completed_at: now, updated_at: now,
    }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: "Unable to save your answers. Please try again." }, { status: 500 });
    return NextResponse.json({ success: true, recommendation });
  } catch { return NextResponse.json({ error: "Unable to prepare your recommendation. Please try again or choose a track manually." }, { status: 500 }); }
}
