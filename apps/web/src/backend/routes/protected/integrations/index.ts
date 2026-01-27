import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerDeleteIntegration } from "./delete";
import { registerGetAllIntegrations } from "./get-all";
import { registerPostIntegration } from "./post";
import { registerPutIntegration } from "./put";

const integrations = new OpenAPIHono<AppEnv>();

integrations.use("/:teamId", requireTeamMember());
integrations.use("/:teamId/*", requireTeamMember());

registerGetAllIntegrations(integrations);
registerPostIntegration(integrations);
registerPutIntegration(integrations);
registerDeleteIntegration(integrations);

export { integrations };
