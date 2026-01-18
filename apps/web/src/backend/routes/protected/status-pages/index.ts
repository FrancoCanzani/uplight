import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerCheckSlug } from "./check-slug";
import { registerDeleteStatusPage } from "./delete";
import { registerGetStatusPage } from "./get";
import { registerGetAllStatusPages } from "./get-all";
import { registerDeleteGroup } from "./groups/delete";
import { registerPostGroup } from "./groups/post";
import { registerPutGroup } from "./groups/put";
import { registerDeleteLogo } from "./logo/delete";
import { registerUploadLogo } from "./logo/upload";
import { registerDeleteMonitor } from "./monitors/delete";
import { registerPostMonitor } from "./monitors/post";
import { registerPutMonitor } from "./monitors/put";
import { registerPostStatusPage } from "./post";
import { registerPutStatusPage } from "./put";

const statusPages = new OpenAPIHono<AppEnv>();

statusPages.use("/:teamId", requireTeamMember());
statusPages.use("/:teamId/*", requireTeamMember());

registerGetAllStatusPages(statusPages);
registerGetStatusPage(statusPages);
registerPostStatusPage(statusPages);
registerPutStatusPage(statusPages);
registerDeleteStatusPage(statusPages);
registerCheckSlug(statusPages);

registerPostGroup(statusPages);
registerPutGroup(statusPages);
registerDeleteGroup(statusPages);

registerPostMonitor(statusPages);
registerPutMonitor(statusPages);
registerDeleteMonitor(statusPages);

registerUploadLogo(statusPages);
registerDeleteLogo(statusPages);

export { statusPages };
