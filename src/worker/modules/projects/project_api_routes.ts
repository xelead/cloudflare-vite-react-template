import projects from "@src/worker/modules/projects/projects.json" assert { type: "json" };
import { render } from "@src/react-app/ssr/render.tsx";
import { IApp } from "@src/interfaces/api.ts";

export class ProjectApiRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}
	register_routes() {
		const app = this.app;
		// API
		app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
		app.get("/api/projects", (c) => c.json({ projects }));

		// SSR
		app.get("/projects", (c) => {
			const { html } = render(new URL(c.req.url).pathname, { projects });
			return c.html(html);
		});
	}
}
