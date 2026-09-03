import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapProject } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ data: mapProject(data as unknown as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "Unable to load project" }, { status: 500 });
  }
}
