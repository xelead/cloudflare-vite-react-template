import { Hono } from "hono";
import { register_dynamic_routes } from "@src/api/route_registry.ts";
import { setWorkerEnv } from "@src/api/fw/config/env_helpers.ts";
import { closeCoreDbFromExecContext } from "@src/api/db/coredb_exec_context.ts";
import type { IApiVariables } from "@src/api/fw/api_app_types.ts";
import {
	is_html_document_request,
	render_html_page,
} from "@src/api/fw/ssr/html_page_response.ts";

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

app.notFound((c) => {
	if (is_html_document_request(c)) {
		return render_html_page(c, c.req.path, 404);
	}

	return c.text("Not Found", 404);
});

app.onError((error, c) => {
	console.error("Unhandled server error:", error);
	if (is_html_document_request(c)) {
		return render_html_page(c, "/500", 500);
	}

	return c.json(
		{
			error: "Internal server error.",
		},
		500,
	);
});

export default app;
