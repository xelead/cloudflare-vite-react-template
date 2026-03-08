import people from "@src/worker/modules/people/people.json" assert { type: "json" };
import { IApp } from "@src/interfaces/api.ts";

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
