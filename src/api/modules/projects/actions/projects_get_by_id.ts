import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { getProjectById } from "@src/api/modules/projects/projects_store.ts";

export const route = {
	method: "get",
	path: "/api/projects/:project_id",
} as const;

type ProjectLookupRequest = {
	project_id?: string;
};

export default async function projectsGetById(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const db = await context.getCoreDbAsync();
	const request_data = await context.getRequestDataAsync<ProjectLookupRequest>();
	const project_id = request_data.project_id?.trim();

	if (!project_id) {
		return ApiRes.validationError("Project id is required.");
	}

	const project = await getProjectById(db, project_id);
	if (!project) {
		return ApiRes.error("Project not found.", 404, "not_found");
	}

	return ApiRes.ok(project);
}
