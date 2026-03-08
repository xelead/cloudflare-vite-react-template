import people from "@src/worker/modules/people/people.json" assert { type: "json" };
import { render } from "@src/react-app/ssr/render.tsx";
import { IApp } from "@src/interfaces/api.ts";

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
