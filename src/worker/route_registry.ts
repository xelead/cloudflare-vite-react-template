import { IApp } from "@src/interfaces/api.ts";

type RouteClass = new (app: IApp) => { register_routes: () => void };
type RouteRegistrar = (app: IApp) => void;
type RouteModule = Record<string, unknown>;

const route_modules = import.meta.glob("./modules/**/*_routes.ts", { eager: true });

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

export function register_dynamic_routes(app: IApp) {
	for (const module_exports of Object.values(route_modules)) {
		register_from_module_exports(app, module_exports as RouteModule);
	}
}
