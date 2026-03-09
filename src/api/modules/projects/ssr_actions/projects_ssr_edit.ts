import { render } from "@src/ui/ssr/render.tsx";
import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { getProjectById } from "@src/api/modules/projects/projects_store.ts";

export const route = {
	method: "get",
	path: "/projects/:project_id/edit",
} as const;

export default async function projectsSsrEdit(c: IAppContext) {
	const project_id = c.req.param("project_id");
	const db = c.get("coreDb");
	const project = project_id ? await getProjectById(db, project_id) : null;
	const projects = project ? [project] : [];
	const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
	return c.html(html);
}
