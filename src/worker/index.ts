import { Hono } from "hono";
import {ProjectApiRoutes} from "@src/worker/modules/projects/project_api_routes.ts";
import {ProjectSsrRoutes} from "@src/worker/modules/projects/project_ssr_routes.ts";

const app = new Hono<{ Bindings: Env }>();

new ProjectApiRoutes(app).register_routes()
new ProjectSsrRoutes(app).register_routes()

export default app;
