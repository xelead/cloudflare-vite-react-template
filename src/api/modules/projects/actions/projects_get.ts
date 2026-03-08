import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject, type IProjectList } from "@src/api/modules/projects/project_types.ts";
import projects from "@src/api/modules/projects/projects.json" assert { type: "json" };

export default async function projectsGet(_context: IApiRequestContext): Promise<IApiResult<IProjectList>> {
	return ApiRes.ok({
		list: projects as Array<IProject>,
	});
}
