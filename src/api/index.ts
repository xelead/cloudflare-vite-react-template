import { Hono } from "hono";
import { register_dynamic_routes } from "@src/api/route_registry.ts";
import { setWorkerEnv } from "@src/api/fw/config/env_helpers.ts";
import { closeCoreDbFromExecContext } from "@src/api/db/coredb_exec_context.ts";
import type { IApiVariables } from "@src/api/fw/api_app_types.ts";

const app = new Hono<{ Bindings: Env; Variables: IApiVariables }>();

app.use("*", async (c, next) => {
	setWorkerEnv(c.env as Record<string, string>);
	try {
		await next();
	} finally {
		await closeCoreDbFromExecContext(c);
	}
});

register_dynamic_routes(app);

export default app;
