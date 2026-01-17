import { createFileRoute } from "@tanstack/react-router";
import { TeamManagementPage } from "@/features/teams/components/team-management-page";

export const Route = createFileRoute("/(dashboard)/$teamId/team")({
  component: TeamManagementPage,
});
