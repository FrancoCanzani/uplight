import { createFileRoute } from "@tanstack/react-router";
import fetchNotifiers from "@/features/notifications/api/fetch-notifiers";
import NotificationsPage from "@/features/notifications/components/notifications-page";

export const Route = createFileRoute("/(dashboard)/$teamId/notifications/")({
  loader: async ({ params }) => {
    const notifiers = await fetchNotifiers(params.teamId);
    return { notifiers };
  },
  component: NotificationsPage,
});
