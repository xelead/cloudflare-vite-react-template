import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProjectList } from "@src/api/modules/projects/project_types.ts";
import { getAllProjects } from "@src/api/modules/projects/projects_store.ts";

export default async function projectsGet(_context: IApiRequestContext): Promise<IApiResult<IProjectList>> {
	return ApiRes.ok({
		list: getAllProjects(),
	});
}
