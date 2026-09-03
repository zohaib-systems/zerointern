import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { projectsData, tracksData } from "@/lib/seedData";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  const { error: tracksError } = await supabase
    .from("tracks")
    .upsert(tracksData, { onConflict: "slug" });

  if (tracksError) throw new Error(`Track seed failed: ${tracksError.message}`);

  const { data: tracks, error: lookupError } = await supabase
    .from("tracks")
    .select("id, slug")
    .in("slug", tracksData.map((track) => track.slug));

  if (lookupError || !tracks) {
    throw new Error(`Track lookup failed: ${lookupError?.message ?? "No tracks returned"}`);
  }

  const trackIds = new Map<string, string>(tracks.map((track) => [track.slug, track.id]));
  const missingTrack = projectsData.find((project) => !trackIds.has(project.trackSlug));
  if (missingTrack) throw new Error(`Missing track for ${missingTrack.title}`);

  for (const project of projectsData) {
    const trackId = trackIds.get(project.trackSlug);
    if (!trackId) throw new Error(`Missing track ID for ${project.trackSlug}`);

    const projectRecord = {
      track_id: trackId,
      title: project.title,
      description: project.description,
      problem: project.problem,
      brief: project.brief,
      resources: project.resources,
      concepts: project.concepts,
      project_order: project.projectOrder,
    };

    const { data: existing, error: existingError } = await supabase
      .from("projects")
      .select("id")
      .eq("track_id", trackId)
      .eq("title", project.title)
      .maybeSingle();

    if (existingError) throw new Error(`Project lookup failed for ${project.title}: ${existingError.message}`);

    const query = existing
      ? supabase.from("projects").update(projectRecord).eq("id", existing.id)
      : supabase.from("projects").insert(projectRecord);
    const { error: projectError } = await query;
    if (projectError) throw new Error(`Project seed failed for ${project.title}: ${projectError.message}`);
  }

  console.log(`Seeded ${tracksData.length} tracks and ${projectsData.length} projects.`);
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database seed failed");
  process.exitCode = 1;
});
