import { TeamManagementPage } from "@/features/teams/components/team-management-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/team")({
  component: TeamManagementPage,
});
