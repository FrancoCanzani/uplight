import { fetchHeartbeat } from "@/features/heartbeats/api/fetch-heartbeat";
import HeartbeatPage from "@/features/heartbeats/components/heartbeat-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/heartbeats/$heartbeatId/"
)({
  loader: ({ params }) =>
    fetchHeartbeat(Number(params.teamId), Number(params.heartbeatId)),
  component: HeartbeatPage,
});
