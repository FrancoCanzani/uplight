import fetchPublicStatusPage from "@/features/status-pages/api/fetch-public-status-page";
import PublicStatusPage from "@/features/status-pages/components/public-status-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status/$slug")({
  loader: ({ params }) => fetchPublicStatusPage(params.slug),
  component: PublicStatusPage,
});
