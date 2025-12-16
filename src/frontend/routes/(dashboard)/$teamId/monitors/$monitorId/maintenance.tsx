import MaintenancePage from "@/features/maintenances/components/maintenance-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/maintenance"
)({
  component: MaintenancePage,
});
