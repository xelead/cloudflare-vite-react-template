import { Hono } from "hono";
import projects from "./data/projects.json" assert { type: "json" };

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
app.get("/api/projects", (c) => c.json({ projects }));

export default app;
