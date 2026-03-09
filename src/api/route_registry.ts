import { IApp, type IAppContext } from "@src/api/fw/api_app_types.ts";
import { safeApi } from "@src/api/fw/routes/safe_api.ts";
import type { IApiRequestContext, IApiResult } from "@src/interfaces/route_types.ts";

type RouteClass = new (app: IApp) => { register_routes: () => void };
type RouteRegistrar = (app: IApp) => void;
type RouteModule = Record<string, unknown>;
type HttpMethod = "get" | "post" | "patch" | "delete";
type ActionHandler = (request_context: IApiRequestContext) => Promise<IApiResult<unknown>>;
type SsrHttpMethod = "get";
type SsrHandler = (c: IAppContext) => Response | Promise<Response>;

type ActionRouteDefinition = {
	method: HttpMethod;
	path: string;
	handler: ActionHandler;
};

type SsrRouteDefinition = {
	method: SsrHttpMethod;
	path: string;
	handler: SsrHandler;
};

type ActionModule = {
	default?: ActionHandler;
	route?: {
		method?: HttpMethod;
		path?: string;
	};
};

type SsrActionModule = {
	default?: SsrHandler;
	route?: {
		method?: SsrHttpMethod;
		path?: string;
	};
};

const route_modules = import.meta.glob("./modules/**/*_routes.ts", { eager: true });
const action_modules = import.meta.glob("./modules/**/actions/*.ts", { eager: true });
const ssr_action_modules = import.meta.glob("./modules/**/ssr_actions/*.ts", { eager: true });

function is_route_class(value: unknown): value is RouteClass {
	if (typeof value !== "function") {
		return false;
	}

	const prototype_value = (value as { prototype?: { register_routes?: unknown } }).prototype;
	return typeof prototype_value?.register_routes === "function";
}

function is_route_registrar(value: unknown): value is RouteRegistrar {
	return typeof value === "function";
}

function register_from_module_exports(app: IApp, module_exports: RouteModule) {
	for (const export_value of Object.values(module_exports)) {
		if (is_route_class(export_value)) {
			new export_value(app).register_routes();
			continue;
		}

		if (is_route_registrar(export_value)) {
			export_value(app);
		}
	}
}

function get_dynamic_segment_count(path: string): number {
	return path.split("/").filter((segment) => segment.startsWith(":")).length;
}

function get_action_route_definitions(): ActionRouteDefinition[] {
	const definitions: ActionRouteDefinition[] = [];

	for (const module_exports of Object.values(action_modules)) {
		const action_module = module_exports as ActionModule;
		if (!action_module.default || !action_module.route?.method || !action_module.route.path) {
			continue;
		}

		definitions.push({
			method: action_module.route.method,
			path: action_module.route.path,
			handler: action_module.default,
		});
	}

	return definitions.sort((a, b) => {
		const dynamic_segment_comparison =
			get_dynamic_segment_count(a.path) - get_dynamic_segment_count(b.path);

		if (dynamic_segment_comparison !== 0) {
			return dynamic_segment_comparison;
		}

		return a.path.localeCompare(b.path);
	});
}

function register_action_route(app: IApp, definition: ActionRouteDefinition) {
	const handler = (c: IAppContext) =>
		safeApi(c, (request_context) => definition.handler(request_context));

	switch (definition.method) {
		case "get":
			app.get(definition.path, handler);
			return;
		case "post":
			app.post(definition.path, handler);
			return;
		case "patch":
			app.patch(definition.path, handler);
			return;
		case "delete":
			app.delete(definition.path, handler);
			return;
	}
}

function get_ssr_route_definitions(): SsrRouteDefinition[] {
	const definitions: SsrRouteDefinition[] = [];

	for (const module_exports of Object.values(ssr_action_modules)) {
		const action_module = module_exports as SsrActionModule;
		if (!action_module.default || !action_module.route?.method || !action_module.route.path) {
			continue;
		}

		definitions.push({
			method: action_module.route.method,
			path: action_module.route.path,
			handler: action_module.default,
		});
	}

	return definitions.sort((a, b) => {
		const dynamic_segment_comparison =
			get_dynamic_segment_count(a.path) - get_dynamic_segment_count(b.path);

		if (dynamic_segment_comparison !== 0) {
			return dynamic_segment_comparison;
		}

		return a.path.localeCompare(b.path);
	});
}

function register_ssr_route(app: IApp, definition: SsrRouteDefinition) {
	switch (definition.method) {
		case "get":
			app.get(definition.path, definition.handler);
			return;
	}
}

export function register_dynamic_routes(app: IApp) {
	for (const module_exports of Object.values(route_modules)) {
		register_from_module_exports(app, module_exports as RouteModule);
	}

	for (const definition of get_action_route_definitions()) {
		register_action_route(app, definition);
	}

	for (const definition of get_ssr_route_definitions()) {
		register_ssr_route(app, definition);
	}
}
