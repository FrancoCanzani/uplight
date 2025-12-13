import { Context, Next } from "hono";
import { createAuth } from "../../../auth";

export async function authMiddleware(c: Context, next: Next) {
  const authInstance = createAuth(c.env);

  const session = await authInstance.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
}

export async function requireAuth(c: Context, next: Next) {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}
