import { ApiRes, type IApiResult } from "@src/interfaces/route_types.ts";
import { get_project_entity_meta } from "@src/api/modules/projects/project_en.ts";

export const route = {
	method: "get",
	path: "/api/projects/meta",
} as const;

type ProjectsMetaResponse = ReturnType<typeof get_project_entity_meta>;

export default async function projectsGetMeta(): Promise<IApiResult<ProjectsMetaResponse>> {
	return ApiRes.ok(get_project_entity_meta());
}
