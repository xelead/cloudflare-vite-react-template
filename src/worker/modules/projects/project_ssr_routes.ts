import projects from "@src/worker/modules/projects/projects.json" assert { type: "json" };
import {render} from "@src/react-app/ssr/render.tsx";
import {IApp} from "@src/interfaces/api.ts";

export class ProjectSsrRoutes {
    private app: IApp;

    constructor(app: IApp) {
        this.app = app
    }
    register_routes() {
        const app = this.app
        // SSR
        app.get("/projects", (c) => {
            const { html } = render(new URL(c.req.url).pathname, { projects });
            return c.html(html);
        });
    }
}
