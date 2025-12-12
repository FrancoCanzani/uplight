import { Hono } from "hono";

const monitors = new Hono<{ Bindings: Env }>();

export { monitors };

