import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { softDeleteProject } from "@src/api/modules/projects/projects_store.ts";

type ProjectDeleteRequest = {
	project_id?: string;
};

export default async function projectsSoftDelete(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const request_data = await context.getRequestDataAsync<ProjectDeleteRequest>();
	const project_id = request_data.project_id?.trim();
	if (!project_id) {
		return ApiRes.validationError("Project id is required.");
	}

	const deleted_project = await softDeleteProject(project_id);
	if (!deleted_project) {
		return ApiRes.error("Project not found.", 404, "not_found");
	}

	return ApiRes.ok(deleted_project);
}
