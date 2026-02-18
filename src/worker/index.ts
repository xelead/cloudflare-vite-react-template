import { Hono } from "hono";
import projects from "./data/projects.json" assert { type: "json" };
import { render } from "../react-app/ssr/render";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
app.get("/api/projects", (c) => c.json({ projects }));
app.get("/projects", (c) => {
	const { html } = render(new URL(c.req.url).pathname, { projects });
	return c.html(html);
});

export default app;
