import { IApp } from "@src/api/fw/api_app_types.ts";
import { SafeApiRouteModule } from "@src/api/fw/routes/safe_api_route.ts";
import publicconfigGet from "@src/api/modules/publicconfig/actions/publicconfig_get.ts";

export class PublicConfigApiRoutes extends SafeApiRouteModule {
	constructor(app: IApp) {
		super(app);
	}
	register_routes() {
		this.get("/api/publicconfig", (c, _request_context) => {
			c.header("Cache-Control", "no-store, max-age=0");
			return publicconfigGet();
		});
	}
}
