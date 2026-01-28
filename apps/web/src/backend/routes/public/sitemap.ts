import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { statusPage } from "../../db/schema";
import type { AppEnv } from "../../types";

const BASE_URL = "https://uplight.dev";

export function registerSitemap(api: OpenAPIHono<AppEnv>) {
  return api.get("/sitemap.xml", async (c) => {
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
      {
        loc: BASE_URL,
        lastmod: today,
        changefreq: "weekly",
        priority: "1.0",
      },
      // Dynamic status pages
      ...publicStatusPages.map((page) => ({
        loc: `${BASE_URL}/status/${page.slug}`,
        lastmod: page.updatedAt
          ? page.updatedAt.toISOString().split("T")[0]
          : today,
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
