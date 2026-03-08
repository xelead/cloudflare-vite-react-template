import { IApp } from "@src/api/fw/api_app_types.ts";
import { SafeApiRouteModule } from "@src/api/fw/routes/safe_api_route.ts";
import projectsGet from "@src/api/modules/projects/actions/projects_get.ts";

export class ProjectApiRoutes extends SafeApiRouteModule {
	constructor(app: IApp) {
		super(app);
	}
	register_routes() {
		this.get("/api/projects", (_c, request_context) => projectsGet(request_context));
	}
}
