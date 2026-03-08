import {ApiRes, IApiRequestContext, IApiResult} from "@src/interfaces/route_types.ts";
import { IProjectList} from "@src/api/modules/projects/project_types.ts";
import projects from "@src/api/modules/projects/projects.json" assert { type: "json" };

export default async function projectGet(context: IApiRequestContext, req: IApiRequestContext)
    : Promise<IApiResult<IProjectList>> {
    
    return ApiRes.ok(projects);
}
