import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const redirectTo = new URL("/api/auth/callback", request.url).toString();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error || !data.url) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to start Google sign in" },
        { status: 500 },
      );
    }

    return NextResponse.redirect(data.url);
  } catch {
    return NextResponse.json(
      { error: "Unable to start Google sign in" },
      { status: 500 },
    );
  }
}
