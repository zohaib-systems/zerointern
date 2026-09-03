import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminCookieName } from "@/lib/auth";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const password = typeof body === "object" && body !== null && "password" in body
      ? (body as { password?: unknown }).password
      : undefined;

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const { data: admin, error } = await getAdminClient()
      .from("admins")
      .select("email, password_hash")
      .eq("email", "admin@zerointern.com")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Unable to verify admin credentials" }, { status: 500 });
    }

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({ email: admin.email, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(admin.email)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecret());

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: adminCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to process admin login" }, { status: 500 });
  }
}
