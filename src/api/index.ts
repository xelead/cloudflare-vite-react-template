import { Hono } from "hono";
import { register_dynamic_routes } from "@src/api/route_registry.ts";

const app = new Hono<{ Bindings: Env }>();

register_dynamic_routes(app);

export default app;
