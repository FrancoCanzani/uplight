import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$teamId/maintenances-new",
      params: { teamId: params.teamId },
      search: { monitorId: params.monitorId },
    });
  },
});
