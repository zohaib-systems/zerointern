import DashboardTrackContent from "@/components/track/DashboardTrackContent";
export default async function DashboardTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  return <DashboardTrackContent trackId={trackId} />;
}
