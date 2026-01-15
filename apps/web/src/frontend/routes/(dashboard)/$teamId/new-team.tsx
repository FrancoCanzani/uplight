import { NewTeamPage } from "@/features/teams/components/new-team-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/new-team")({
  component: NewTeamPage,
});
