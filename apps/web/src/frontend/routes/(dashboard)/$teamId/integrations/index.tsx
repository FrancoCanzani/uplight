import { createFileRoute } from "@tanstack/react-router";
import fetchIntegrations from "@/features/integrations/api/fetch-integrations";
import IntegrationsPage from "@/features/integrations/components/integrations-page";

export const Route = createFileRoute("/(dashboard)/$teamId/integrations/")({
  loader: async ({ params }) => {
    const integrations = await fetchIntegrations(params.teamId);
    return { integrations };
  },
  component: IntegrationsPage,
});
