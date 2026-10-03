import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ emailEnabled: z.boolean() }).strict();

export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to update preferences" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid email preference" }, { status: 400 });
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id, email_enabled: parsed.data.emailEnabled, updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Unable to save preferences. Please try again." }, { status: 500 });
  return NextResponse.json({ emailEnabled: parsed.data.emailEnabled });
}
