import people from "@src/api/modules/people/people.json" assert { type: "json" };
import { render } from "@src/ui/ssr/render.tsx";
import { IApp } from "@src/api/fw/api_app_types.ts";

export class PeopleSsrRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}

	register_routes() {
		const app = this.app;
		app.get("/people", (c) => {
			const { html } = render(new URL(c.req.url).pathname, { projects: [], people });
			return c.html(html);
		});
	}
}
