import type { IProject } from "@src/api/modules/projects/project_types.ts";
import { getAllProjects, getProjectById } from "@src/api/modules/projects/projects_store.ts";
import { create_entity_ssr_handlers } from "@src/api/fw/ssr/entity_ssr_route_factory.ts";

export const projects_ssr_handlers = create_entity_ssr_handlers<IProject>({
	byIdParamName: "project_id",
	getList: getAllProjects,
	getById: getProjectById,
	toInitialData: (projects) => ({
		projects,
		people: [],
	}),
});
