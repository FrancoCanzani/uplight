import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getLogo } from "../../../lib/r2";
import type { AppEnv } from "../../../types";

export function registerGetLogo(api: OpenAPIHono<AppEnv>) {
  return api.get("/status/logo/:key{.+}", async (c) => {
    const key = c.req.param("key");

    if (!key) {
      throw new HTTPException(400, { message: "Invalid logo key" });
    }

    const logo = await getLogo(c.env.status_page_logos, key);

    if (!logo) {
      throw new HTTPException(404, { message: "Logo not found" });
    }

    return new Response(logo.body, {
      headers: {
        "Content-Type": logo.httpMetadata?.contentType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
}
