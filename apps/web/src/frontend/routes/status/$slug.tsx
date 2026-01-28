import fetchPublicStatusPage from "@/features/status-pages/api/fetch-public-status-page";
import PublicStatusPage from "@/features/status-pages/components/public-status-page";
import { createStatusPageSchema } from "@/components/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status/$slug")({
  loader: ({ params }) => fetchPublicStatusPage(params.slug),
  component: PublicStatusPage,
  head: ({ loaderData, params }) => {
    const { page, overallStatus, stats, groups, ungroupedMonitors } = loaderData;
    const allMonitors = [
      ...groups.flatMap((g) => g.monitors),
      ...ungroupedMonitors,
    ];
    const description =
      page.description ||
      `Current status for ${page.name}. ${stats.operational} of ${stats.total} services operational.`;

    return {
      meta: [
        { title: `${page.name} Status | Uplight` },
        { name: "description", content: description },
        { property: "og:title", content: `${page.name} Status` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [
        { rel: "canonical", href: `https://uplight.dev/status/${params.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            createStatusPageSchema({
              name: page.name,
              description: page.description,
              url: `https://uplight.dev/status/${params.slug}`,
              status: overallStatus,
              services: allMonitors.map((m) => ({
                name: m.name,
                status: m.status,
                uptime: m.uptime,
              })),
            })
          ),
        },
      ],
    };
  },
});
