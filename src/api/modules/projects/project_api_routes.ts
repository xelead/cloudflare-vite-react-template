import { IApp } from "@src/api/fw/api_app_types.ts";
import { SafeApiRouteModule } from "@src/api/fw/routes/safe_api_route.ts";
import projectsGet from "@src/api/modules/projects/actions/projects_get.ts";
import projectsGetById from "@src/api/modules/projects/actions/projects_get_by_id.ts";
import projectsCreate from "@src/api/modules/projects/actions/projects_create.ts";
import projectsPatch from "@src/api/modules/projects/actions/projects_patch.ts";
import projectsSoftDelete from "@src/api/modules/projects/actions/projects_soft_delete.ts";

export class ProjectApiRoutes extends SafeApiRouteModule {
	constructor(app: IApp) {
		super(app);
	}
	register_routes() {
		this.get("/api/projects", (_c, request_context) => projectsGet(request_context));
		this.get("/api/projects/:project_id", (_c, request_context) => projectsGetById(request_context));
		this.post("/api/projects", (_c, request_context) => projectsCreate(request_context));
		this.patch("/api/projects/:project_id", (_c, request_context) => projectsPatch(request_context));
		this.delete("/api/projects/:project_id", (_c, request_context) => projectsSoftDelete(request_context));
	}
}
