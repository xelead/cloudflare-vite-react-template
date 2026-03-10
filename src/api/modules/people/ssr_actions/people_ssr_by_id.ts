import { render } from "@src/ui/ssr/render.tsx";
import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { getPersonById } from "@src/api/modules/people/people_store.ts";

export const route = {
	method: "get",
	path: "/people/:person_id",
} as const;

export default async function peopleSsrById(c: IAppContext) {
	const db = c.get("coreDb");
	const person_id = c.req.param("person_id");
	const person = person_id ? await getPersonById(db, person_id) : null;
	const people = person ? [person] : [];
	const { html } = render(new URL(c.req.url).pathname, { people, projects: [] });
	return c.html(html);
}