import { createFileRoute } from "@tanstack/react-router";
import MaintenancePage from "@/features/maintenances/components/maintenance-page";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
)({
  component: MaintenancePage,
});
