import { createFileRoute } from "@tanstack/react-router";
import NewHeartbeatPage from "@/features/heartbeats/components/new-heartbeat-page";

export const Route = createFileRoute("/(dashboard)/$teamId/heartbeats/new")({
  component: NewHeartbeatPage,
});
