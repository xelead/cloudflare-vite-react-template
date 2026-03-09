import { render } from "@src/ui/ssr/render.tsx";
import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { getAllProjects } from "@src/api/modules/projects/projects_store.ts";

export const route = {
	method: "get",
	path: "/projects",
} as const;

export default async function projectsSsrIndex(c: IAppContext) {
	const db = c.get("coreDb");
	const { list: projects } = await getAllProjects(db, { pageNumber: 1, pageSize: 20 });
	const { html } = render(new URL(c.req.url).pathname, { projects, people: [] });
	return c.html(html);
}
