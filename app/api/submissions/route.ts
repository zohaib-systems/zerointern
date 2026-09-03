import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = body as { projectId?: unknown; repoUrl?: unknown; liveUrl?: unknown };
    if (typeof input.projectId !== "string" || typeof input.repoUrl !== "string" || typeof input.liveUrl !== "string" || !input.projectId || !input.repoUrl || !input.liveUrl) return NextResponse.json({ error: "Project, repository, and live URLs are required" }, { status: 400 });

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { data: project } = await supabase.from("projects").select("id").eq("id", input.projectId).maybeSingle();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const { data: existing } = await supabase.from("submissions").select("id, status").eq("user_id", userData.user.id).eq("project_id", input.projectId).maybeSingle();
    if (existing && existing.status !== "REJECTED") return NextResponse.json({ error: "A submission is already under review or has been approved" }, { status: 409 });
    const submission = { user_id: userData.user.id, project_id: input.projectId, repo_url: input.repoUrl, live_url: input.liveUrl, status: "PENDING", admin_notes: null, rejected_at: null, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { error } = existing
      ? await supabase.from("submissions").update(submission).eq("id", existing.id)
      : await supabase.from("submissions").insert(submission);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { submitted: true } });
  } catch { return NextResponse.json({ error: "Unable to submit project" }, { status: 500 }); }
}
