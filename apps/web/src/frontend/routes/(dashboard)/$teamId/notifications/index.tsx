import NotificationsPage from "@/features/notifications/components/notifications-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/notifications/")({
  component: NotificationsPage,
});
