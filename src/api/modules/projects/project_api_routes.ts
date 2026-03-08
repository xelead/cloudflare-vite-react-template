import projects from "@src/api/modules/projects/projects.json" assert { type: "json" };
import { render } from "@src/ui/ssr/render.tsx";
import {IApp} from "@src/api/fw/api_app_types.ts";
import {safeApi} from "@src/api/fw/routes/safe_api.ts";

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
			safeApi(c,  c,  () => {
				const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
				return c.html(html);
			})
		});
	}
}
