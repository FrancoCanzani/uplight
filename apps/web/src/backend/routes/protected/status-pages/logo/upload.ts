import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage } from "../../../../db/schema";
import {
  deleteLogo,
  generateLogoKey,
  getFileExtension,
  uploadLogo,
  validateLogoFile,
} from "../../../../lib/r2";
import type { AppEnv } from "../../../../types";

const route = createRoute({
  method: "post",
  path: "/:teamId/:pageId/logo",
  tags: ["status-pages"],
  summary: "Upload a logo for a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            logoKey: z.string(),
          }),
        },
      },
      description: "Logo uploaded successfully",
    },
  },
});

export function registerUploadLogo(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId } = c.req.valid("param");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [page] = await db
      .select()
      .from(statusPage)
      .where(
        and(
          eq(statusPage.id, Number(pageId)),
          eq(statusPage.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!page) {
      throw new HTTPException(404, { message: "Status page not found" });
    }

    const formData = await c.req.formData();
    const file = formData.get("logo");

    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, { message: "No file provided" });
    }

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      throw new HTTPException(400, { message: validation.error });
    }

    const extension = getFileExtension(file.type);
    const key = generateLogoKey(teamContext.teamId, Number(pageId), extension);

    const arrayBuffer = await file.arrayBuffer();
    await uploadLogo(c.env.status_page_logos, key, arrayBuffer, file.type);

    if (page.logoKey) {
      await deleteLogo(c.env.status_page_logos, page.logoKey);
    }

    await db
      .update(statusPage)
      .set({ logoKey: key })
      .where(eq(statusPage.id, Number(pageId)));

    return c.json({ logoKey: key });
  });
}
