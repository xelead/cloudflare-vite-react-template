import { IApp } from "@src/api/fw/api_app_types.ts";
import { SafeApiRouteModule } from "@src/api/fw/routes/safe_api_route.ts";
import projectsGet from "@src/api/modules/projects/actions/projects_get.ts";
import projectsGetById from "@src/api/modules/projects/actions/projects_get_by_id.ts";

export class ProjectApiRoutes extends SafeApiRouteModule {
	constructor(app: IApp) {
		super(app);
	}
	register_routes() {
		this.get("/api/projects", (_c, request_context) => projectsGet(request_context));
		this.get("/api/projects/:project_id", (_c, request_context) => projectsGetById(request_context));
	}
}
