import { Hono } from "hono";
import { register_dynamic_routes } from "@src/api/route_registry.ts";
import { setWorkerEnv } from "@src/api/fw/config/env_helpers.ts";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
	setWorkerEnv(c.env as Record<string, string>);
	await next();
});

register_dynamic_routes(app);

export default app;
