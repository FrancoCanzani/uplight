import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetAllIncidents } from "./get-all";

const incidents = new OpenAPIHono<AppEnv>();

incidents.use("/:teamId", requireTeamMember());

registerGetAllIncidents(incidents);

export { incidents };
