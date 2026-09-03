import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await signOut();
    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
  }
}
