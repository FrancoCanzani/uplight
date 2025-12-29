import NewHeartbeatPage from "@/features/heartbeats/components/new-heartbeat-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/heartbeats/new")({
  component: NewHeartbeatPage,
});
