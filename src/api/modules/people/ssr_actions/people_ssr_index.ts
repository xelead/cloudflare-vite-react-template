import { render } from "@src/ui/ssr/render.tsx";
import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { getAllPeople } from "@src/api/modules/people/people_store.ts";

export const route = {
	method: "get",
	path: "/people",
} as const;

export default async function peopleSsrIndex(c: IAppContext) {
	const db = c.get("coreDb");
	const { list: people } = await getAllPeople(db, { pageNumber: 1, pageSize: 20 });
	const { html } = render(new URL(c.req.url).pathname, { people, projects: [] });
	return c.html(html);
}