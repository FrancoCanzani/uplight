import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Uptime test service");
});

app.get("/ok", (c) => {
  return c.json({ status: "ok" }, 200);
});

app.get("/error", (c) => {
  return c.json({ status: "error" }, 500);
});

app.get("/random", (c) => {
  const codes: ContentfulStatusCode[] = [200, 500];

  const code = codes[Math.floor(Math.random() * codes.length)];

  return c.json({ status: code === 200 ? "ok" : "error" }, code);
});

app.get("/slow", async (c) => {
  // simulate 30s latency
  await new Promise((resolve) => setTimeout(resolve, 30_000));

  return c.json({ status: "slow but ok" }, 200);
});

let delay = 1000;

app.get("/degrading", async (c) => {
  await new Promise((r) => setTimeout(r, delay));

  delay = Math.min(delay + 1000, 30_000); // grows to 30s max

  return c.json({ delay }, 200);
});

app.get("/flaky", (c) => {
  const fail = Math.random() < 0.2; // 20% failure rate

  if (fail) {
    return c.json({ status: "error" }, 500);
  }

  return c.json({ status: "ok" }, 200);
});

export default app;
