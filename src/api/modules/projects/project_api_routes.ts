import { IApp } from "@src/api/fw/api_app_types.ts";
import { SafeApiRouteModule } from "@src/api/fw/routes/safe_api_route.ts";

export class ProjectApiRoutes extends SafeApiRouteModule {
	constructor(app: IApp) {
		super(app);
	}

	register_routes() {
		// Project action routes are auto-registered in src/api/route_registry.ts.
	}
}
