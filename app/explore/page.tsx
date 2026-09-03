import { createClient } from "@/lib/supabase/server";
import { mapTrack } from "@/lib/data";
import Navbar from "@/components/common/Navbar";
import TrackGrid from "@/components/common/TrackGrid";
import ErrorAlert from "@/components/common/ErrorAlert";

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tracks").select("*").order("title");
  if (error) return <main className="min-h-screen bg-[#0b0b0f] px-6 py-16 text-white"><div className="mx-auto max-w-2xl"><ErrorAlert message="Unable to load tracks right now." /></div></main>;
  const tracks = (data ?? []).map((row) => mapTrack(row));
  return <main className="min-h-screen bg-[#0b0b0f] text-white"><Navbar /><section className="mx-auto max-w-6xl px-6 py-14"><p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Explore</p><h1 className="mt-3 text-4xl font-bold">Choose your next track</h1><p className="mt-4 max-w-2xl text-zinc-400">Browse guided projects and start building at your own pace.</p><div className="mt-10"><TrackGrid tracks={tracks} /></div></section></main>;
}
