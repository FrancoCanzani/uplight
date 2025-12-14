import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import MonitorsPage from "@/features/monitors/components/monitors-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/monitors/")({
  loader: ({ params }) => fetchMonitors(params.teamId),

  component: MonitorsPage,
});
