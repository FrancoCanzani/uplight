import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerPostNotifier } from "./post";
import { registerGetAllNotifiers } from "./get-all";
import { registerPutNotifier } from "./put";
import { registerDeleteNotifier } from "./delete";

const notifications = new OpenAPIHono<AppEnv>();

notifications.use("/:teamId", requireTeamMember());
notifications.use("/:teamId/*", requireTeamMember());

registerGetAllNotifiers(notifications);
registerPostNotifier(notifications);
registerPutNotifier(notifications);
registerDeleteNotifier(notifications);

export { notifications };
