import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerPostMaintenance } from "./post";
import { registerGetAllMaintenance } from "./get-all";
import { registerPutMaintenance } from "./put";
import { registerDeleteMaintenance } from "./delete";

const maintenance = new OpenAPIHono<AppEnv>();

maintenance.use("/:teamId", requireTeamMember());
maintenance.use("/:teamId/*", requireTeamMember());

registerPostMaintenance(maintenance);
registerGetAllMaintenance(maintenance);
registerPutMaintenance(maintenance);
registerDeleteMaintenance(maintenance);

export { maintenance };
