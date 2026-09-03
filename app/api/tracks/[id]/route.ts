import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapProject, mapTrack } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("tracks").select("*, projects(*)").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Track not found" }, { status: 404 });
    const projectRows = Array.isArray(data.projects) ? (data.projects as unknown[]) : [];
    const projects = projectRows.map((project) => mapProject(project as Record<string, unknown>)).sort((a, b) => a.projectOrder - b.projectOrder);
    return NextResponse.json({ data: { track: mapTrack(data as unknown as Record<string, unknown>), projects } });
  } catch {
    return NextResponse.json({ error: "Unable to load track" }, { status: 500 });
  }
}
