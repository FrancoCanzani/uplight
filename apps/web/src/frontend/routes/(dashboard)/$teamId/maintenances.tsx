import MaintenancePage from "@/features/maintenances/components/maintenance-page";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  monitorId: z.string().optional(),
});

export const Route = createFileRoute("/(dashboard)/$teamId/maintenances")({
  validateSearch: searchSchema,
  component: MaintenancePage,
});
