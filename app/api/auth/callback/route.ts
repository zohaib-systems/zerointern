import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/auth/callback?error=${encodeURIComponent(errorDescription)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/callback?error=Missing OAuth code", request.url),
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/auth/callback?error=${encodeURIComponent(exchangeError.message)}`, request.url),
      );
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      return NextResponse.redirect(
        new URL("/auth/callback?error=Unable to load authenticated user", request.url),
      );
    }

    const user = userData.user;
    const adminClient = getAdminClient();
    const { error: databaseError } = await adminClient.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
        profile_pic: user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (databaseError) {
      console.error("Unable to save user profile:", databaseError.message);
      return NextResponse.redirect(
        new URL(`/auth/callback?error=${encodeURIComponent("Unable to save user profile")}`, request.url),
      );
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/auth/callback?error=Authentication failed", request.url),
    );
  }
}
