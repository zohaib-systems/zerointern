import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ projectId: z.string().uuid(), repoUrl: z.string().url().startsWith("https://"), liveUrl: z.string().url().startsWith("https://") });
export async function POST(request: Request) {
	try {
		const parsed = schema.safeParse(await request.json());
		if (!parsed.success) return NextResponse.json({ error: "Valid HTTPS repository and live URLs are required" }, { status: 400 });
		const supabase = await createClient();
		const { data: auth } = await supabase.auth.getUser();
		if (!auth.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
		const { data: project } = await supabase.from("projects").select("id, track_id").eq("id", parsed.data.projectId).maybeSingle();
		if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
		const { data: enrollment } = await supabase.from("track_enrollments").select("id").eq("user_id", auth.user.id).eq("track_id", project.track_id).maybeSingle();
		if (!enrollment) return NextResponse.json({ error: "Enroll in this track first" }, { status: 403 });
		const { data: existing } = await supabase.from("submissions").select("id, status").eq("user_id", auth.user.id).eq("project_id", parsed.data.projectId).maybeSingle();
		if (existing && existing.status !== "REJECTED") return NextResponse.json({ error: "A submission is already under review or has been approved" }, { status: 409 });

		const query = existing
			? supabase.from("submissions").update({ repo_url: parsed.data.repoUrl, live_url: parsed.data.liveUrl, status: "PENDING", admin_notes: null, rejected_at: null, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", existing.id).select("id, status").single()
			: supabase.from("submissions").insert({ user_id: auth.user.id, project_id: parsed.data.projectId, repo_url: parsed.data.repoUrl, live_url: parsed.data.liveUrl, status: "PENDING" }).select("id, status").single();
		const { data: submission, error } = await query;
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ data: { submissionId: submission.id, status: submission.status } }, { status: existing ? 200 : 201 });
	} catch {
		return NextResponse.json({ error: "Unable to create submission" }, { status: 500 });
	}
}
