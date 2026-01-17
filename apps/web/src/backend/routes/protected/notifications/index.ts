import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerDeleteNotifier } from "./delete";
import { registerGetAllNotifiers } from "./get-all";
import { registerPostNotifier } from "./post";
import { registerPutNotifier } from "./put";

const notifications = new OpenAPIHono<AppEnv>();

notifications.use("/:teamId", requireTeamMember());
notifications.use("/:teamId/*", requireTeamMember());

registerGetAllNotifiers(notifications);
registerPostNotifier(notifications);
registerPutNotifier(notifications);
registerDeleteNotifier(notifications);

export { notifications };
