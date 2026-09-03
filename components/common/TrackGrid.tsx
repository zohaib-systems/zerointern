import type { Track } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import TrackCard from "@/components/track/TrackCard";
import ComingSoonCard from "@/components/common/ComingSoonCard";

interface TrackGridProps {
  tracks: Track[];
}

export default async function TrackGrid({ tracks }: TrackGridProps) {
  const user = await getUser();
  let enrolledIds = new Set<string>();
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("track_enrollments").select("track_id").eq("user_id", user.id);
    enrolledIds = new Set((data ?? []).map((row) => row.track_id));
  }

  const comingSoon = [{ title: "Go Backend", slug: "go-backend" }, { title: "Rust Systems", slug: "rust-systems" }, { title: "DevOps & Cloud", slug: "devops-cloud" }];
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tracks.map((track) => <TrackCard key={track.id} track={track} isEnrolled={enrolledIds.has(track.id)} />)}{comingSoon.map((track) => <ComingSoonCard key={track.slug} {...track} />)}</div>;
}
