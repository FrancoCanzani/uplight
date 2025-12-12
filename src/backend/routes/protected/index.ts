import { Hono } from "hono";
import { monitors } from "./monitors";

const protectedRouter = new Hono<{ Bindings: Env }>();

protectedRouter.route("/monitors", monitors);

export { protectedRouter };

