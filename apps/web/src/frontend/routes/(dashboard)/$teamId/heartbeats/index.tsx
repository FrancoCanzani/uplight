import { fetchHeartbeats } from "@/features/heartbeats/api/fetch-heartbeats";
import HeartbeatsPage from "@/features/heartbeats/components/heartbeats-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/heartbeats/")({
  loader: ({ params }) => fetchHeartbeats(Number(params.teamId)),
  component: HeartbeatsPage,
});
