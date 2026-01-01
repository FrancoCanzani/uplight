import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetAllIncidents } from "./get-all";
import { registerPatchIncident } from "./patch";

const incidents = new OpenAPIHono<AppEnv>();

incidents.use("/:teamId", requireTeamMember());
incidents.use("/:teamId/:incidentId", requireTeamMember());

registerGetAllIncidents(incidents);
registerPatchIncident(incidents);

export { incidents };
