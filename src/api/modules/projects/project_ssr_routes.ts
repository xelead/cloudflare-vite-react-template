import { render } from "@src/ui/ssr/render.tsx";
import { IApp } from "@src/api/fw/api_app_types.ts";
import { getAllProjects } from "@src/api/modules/projects/projects_store.ts";

export class ProjectSsrRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}
	register_routes() {
		const app = this.app;
		const load_projects = async () => {
			try {
				const { list } = await getAllProjects({ pageNumber: 1, pageSize: 100 });
				return list;
			} catch (error) {
				console.error("Projects SSR load failed", error);
				return [];
			}
		};

		// SSR
		app.get("/projects", async (c) => {
			const projects = await load_projects();
			const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
			return c.html(html);
		});
		app.get("/projects/:project_id", async (c) => {
			const projects = await load_projects();
			const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
			return c.html(html);
		});
		app.get("/projects/:project_id/edit", async (c) => {
			const projects = await load_projects();
			const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
			return c.html(html);
		});
	}
}
