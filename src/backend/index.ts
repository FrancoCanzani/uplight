import { Hono } from "hono";
import { createAuth } from "../../auth";

const app = new Hono<{ Bindings: Env }>();

app.all("/api/auth/*", async (c) => {
    if (!c.env.DB) {
        return c.json({ error: "Database not available" }, 500);
    }
    const authInstance = createAuth(c.env);
    return authInstance.handler(c.req.raw);
});

app.get("/api/", async (c) => {
    return c.json({
        name: "Cloudflare Workers",
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

export default app;
