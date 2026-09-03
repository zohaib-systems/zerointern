import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapTrack } from "@/lib/data";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tracks").select("*").order("title");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: (data ?? []).map((row) => mapTrack(row)) });
  } catch {
    return NextResponse.json({ error: "Unable to load tracks" }, { status: 500 });
  }
}
