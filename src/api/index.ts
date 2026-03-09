import { Hono } from "hono";
import { register_dynamic_routes } from "@src/api/route_registry.ts";
import { setWorkerEnv } from "@src/api/fw/config/env_helpers.ts";
import { connectToCoreDbSession } from "@src/api/db/coredb.ts";
import type { IApiVariables } from "@src/api/fw/api_app_types.ts";

const app = new Hono<{ Bindings: Env; Variables: IApiVariables }>();

app.use("*", async (c, next) => {
	setWorkerEnv(c.env as Record<string, string>);
	const pathname = new URL(c.req.url).pathname;
	const needs_project_db =
		pathname === "/projects" ||
		pathname.startsWith("/projects/") ||
		pathname === "/api/projects" ||
		pathname.startsWith("/api/projects/");
	const is_project_meta_route = pathname === "/api/projects/meta";

	if (!needs_project_db || is_project_meta_route) {
		await next();
		return;
	}

	const session = await connectToCoreDbSession();
	c.set("coreDb", session.db);
	try {
		await next();
	} finally {
		await session.close();
	}
});

register_dynamic_routes(app);

export default app;
