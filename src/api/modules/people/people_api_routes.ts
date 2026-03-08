import people from "@src/api/modules/people/people.json" assert { type: "json" };
import { IApp } from "@src/api/fw/api_app_types.ts";

export class PeopleApiRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}

	register_routes() {
		const app = this.app;
		app.get("/api/people", (c) => c.json({ people }));
	}
}
