import { Hono } from "hono";

export type IApp = Hono<{ Bindings: Env }>;
