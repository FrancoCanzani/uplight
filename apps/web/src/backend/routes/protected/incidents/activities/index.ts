import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../../middleware/team";
import type { AppEnv } from "../../../../types";
import { registerGetIncidentActivities } from "./get";
import { registerPostIncidentActivity } from "./post";

const incidentActivities = new OpenAPIHono<AppEnv>();

incidentActivities.use("/:teamId/:incidentId/activities", requireTeamMember());

registerGetIncidentActivities(incidentActivities);
registerPostIncidentActivity(incidentActivities);

export { incidentActivities };
