import { createFileRoute } from "@tanstack/react-router";
import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import MonitorsPage from "@/features/monitors/components/monitors-page";

export const Route = createFileRoute("/(dashboard)/$teamId/monitors/")({
  loader: ({ params }) => fetchMonitors(params.teamId),

  component: MonitorsPage,
});
