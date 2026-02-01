import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { statusPage } from "../db/schema";
import type { AppEnv } from "../types";

const BASE_URL = "https://uplight.francocanzani.workers.dev";

// Static pages that should always be in the sitemap
const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guides", changefreq: "weekly", priority: "0.8" },
  { path: "/use-cases", changefreq: "weekly", priority: "0.8" },
  { path: "/compare", changefreq: "weekly", priority: "0.8" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
  { path: "/terms", changefreq: "monthly", priority: "0.3" },
  // Guide pages
  { path: "/guides/cloudflare-deploy", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/ssl-monitoring", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/status-page-setup", changefreq: "monthly", priority: "0.7" },
  // Integration guides
  { path: "/guides/integrations/slack", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/integrations/discord", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/integrations/webhooks", changefreq: "monthly", priority: "0.7" },
  // Use case pages
  { path: "/use-cases/saas", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/ecommerce", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/api-monitoring", changefreq: "monthly", priority: "0.7" },
  // Comparison pages
  { path: "/compare/uptimerobot", changefreq: "monthly", priority: "0.7" },
  { path: "/compare/betteruptime", changefreq: "monthly", priority: "0.7" },
  { path: "/compare/pingdom", changefreq: "monthly", priority: "0.7" },
  { path: "/compare/statuscake", changefreq: "monthly", priority: "0.7" },
];

export function registerSitemap(app: OpenAPIHono<AppEnv>) {
  return app.get("/sitemap.xml", async (c) => {
    const db = createDb(c.env.DB);

    // Get all public status pages
    const publicStatusPages = await db
      .select({ slug: statusPage.slug, updatedAt: statusPage.updatedAt })
      .from(statusPage)
      .where(eq(statusPage.isPublic, true));

    const today = new Date().toISOString().split("T")[0];

    // Build sitemap XML
    const urls = [
      // Static pages
      ...STATIC_PAGES.map((page) => ({
        loc: `${BASE_URL}${page.path}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      })),
      // Dynamic status pages
      ...publicStatusPages.map((page) => ({
        loc: `${BASE_URL}/status/${page.slug}`,
        lastmod: page.updatedAt ? page.updatedAt.toISOString().split("T")[0] : today,
        changefreq: "hourly",
        priority: "0.8",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return c.text(xml, 200, {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    });
  });
}

export function registerRobots(app: OpenAPIHono<AppEnv>) {
  return app.get("/robots.txt", (c) => {
    const robots = `# Uplight robots.txt
# ${BASE_URL}

User-agent: *

# Allow public pages
Allow: /
Allow: /status/
Allow: /guides/
Allow: /use-cases/
Allow: /compare/
Allow: /privacy
Allow: /terms

# Disallow auth and dashboard pages
Disallow: /login
Disallow: /signup
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

    return c.text(robots, 200, {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    });
  });
}
