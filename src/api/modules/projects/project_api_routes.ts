import { IApp } from "@src/api/fw/api_app_types.ts";
import { safeApi } from "@src/api/fw/routes/safe_api.ts";
import projectsGet from "@src/api/modules/projects/actions/projects_get.ts";

export class ProjectApiRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}
	register_routes() {
		const app = this.app;
		app.get("/api/projects", (c) => safeApi(c, (request_context) => projectsGet(request_context)));
	}
}
