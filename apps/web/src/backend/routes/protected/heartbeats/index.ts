import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetHeartbeat } from "./get";
import { registerGetAllHeartbeats } from "./get-all";
import { registerPostHeartbeat } from "./post";
import { registerPutHeartbeat } from "./put";
import { registerDeleteHeartbeat } from "./delete";
import { registerPatchHeartbeatStatus } from "./patch";

const heartbeats = new OpenAPIHono<AppEnv>();

heartbeats.use("/:teamId", requireTeamMember());
heartbeats.use("/:teamId/*", requireTeamMember());

registerGetHeartbeat(heartbeats);
registerGetAllHeartbeats(heartbeats);
registerPostHeartbeat(heartbeats);
registerPutHeartbeat(heartbeats);
registerDeleteHeartbeat(heartbeats);
registerPatchHeartbeatStatus(heartbeats);

export { heartbeats };
