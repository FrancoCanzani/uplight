import { createFileRoute } from "@tanstack/react-router";
import fetchPublicStatusPage from "@/features/status-pages/api/fetch-public-status-page";
import PublicStatusPageComponent from "@/features/status-pages/components/public-status-page";

export const Route = createFileRoute("/status/$slug")({
  loader: ({ params }) => fetchPublicStatusPage(params.slug),
  component: PublicStatusPageComponent,
  head: ({ params }) => ({
    meta: [{ title: `Status | Uplight` }],
    links: [
      { rel: "canonical", href: `https://uplight.dev/status/${params.slug}` },
    ],
  }),
});
