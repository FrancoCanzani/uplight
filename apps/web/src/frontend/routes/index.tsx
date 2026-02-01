import { createFileRoute } from "@tanstack/react-router";
import LandingPage, { faqSchemaData } from "@/components/landing/landing-page";
import {
  createFAQSchema,
  createSoftwareApplicationSchema,
} from "@/components/seo";
import "../index.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Uplight - Open Source Uptime Monitoring" },
      {
        name: "description",
        content:
          "Monitor your services from multiple regions. Get instant alerts via Slack, Discord, or email when something breaks. Keep users informed with public status pages.",
      },
      {
        property: "og:title",
        content: "Uplight - Open Source Uptime Monitoring",
      },
      {
        property: "og:description",
        content:
          "Monitor your services from multiple regions. Get instant alerts via Slack, Discord, or email when something breaks. Keep users informed with public status pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://uplight.dev" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify([
          createFAQSchema(faqSchemaData),
          createSoftwareApplicationSchema(),
        ]),
      },
    ],
  }),
});
