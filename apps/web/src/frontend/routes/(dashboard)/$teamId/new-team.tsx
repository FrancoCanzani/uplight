import { createFileRoute } from "@tanstack/react-router";
import { NewTeamPage } from "@/features/teams/components/new-team-page";

export const Route = createFileRoute("/(dashboard)/$teamId/new-team")({
  component: NewTeamPage,
});
