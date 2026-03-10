import type { IPerson } from "@src/api/modules/people/people_types.ts";
import { getAllPeople, getPersonById } from "@src/api/modules/people/people_store.ts";
import { create_entity_ssr_handlers } from "@src/api/fw/ssr/entity_ssr_route_factory.ts";

export const people_ssr_handlers = create_entity_ssr_handlers<IPerson>({
	byIdParamName: "person_id",
	getList: getAllPeople,
	getById: getPersonById,
	toInitialData: (people) => ({
		people,
		projects: [],
	}),
});
