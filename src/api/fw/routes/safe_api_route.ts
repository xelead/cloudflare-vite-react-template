import type { IApp, IAppContext } from "@src/api/fw/api_app_types.ts";
import { safeApi } from "@src/api/fw/routes/safe_api.ts";
import type { IApiRequestContext, IApiResult } from "@src/interfaces/route_types.ts";

type ApiAction<T> = (
	c: IAppContext,
	requestContext: IApiRequestContext,
) => Promise<IApiResult<T>> | IApiResult<T>;

export abstract class SafeApiRouteModule {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}

	protected get<T>(path: string, action: ApiAction<T>) {
		this.app.get(path, (c) => safeApi(c, (request_context) => action(c, request_context)));
	}

	protected post<T>(path: string, action: ApiAction<T>) {
		this.app.post(path, (c) => safeApi(c, (request_context) => action(c, request_context)));
	}

	protected patch<T>(path: string, action: ApiAction<T>) {
		this.app.patch(path, (c) => safeApi(c, (request_context) => action(c, request_context)));
	}

	protected delete<T>(path: string, action: ApiAction<T>) {
		this.app.delete(path, (c) => safeApi(c, (request_context) => action(c, request_context)));
	}
}
