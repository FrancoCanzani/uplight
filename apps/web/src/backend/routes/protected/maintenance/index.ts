import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerDeleteMaintenance } from "./delete";
import { registerGetAllMaintenance } from "./get-all";
import { registerPostMaintenance } from "./post";
import { registerPutMaintenance } from "./put";

const maintenance = new OpenAPIHono<AppEnv>();

maintenance.use("/:teamId", requireTeamMember());
maintenance.use("/:teamId/*", requireTeamMember());

registerPostMaintenance(maintenance);
registerGetAllMaintenance(maintenance);
registerPutMaintenance(maintenance);
registerDeleteMaintenance(maintenance);

export { maintenance };
