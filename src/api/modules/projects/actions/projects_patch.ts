import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { updateProject } from "@src/api/modules/projects/projects_store.ts";
import { parse_project_patch_payload } from "@src/api/modules/projects/project_request_parser.ts";

export const route = {
	method: "patch",
	path: "/api/projects/:project_id",
} as const;

export default async function projectsPatch(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const db = await context.getCoreDbAsync();
	const request_data = await context.getRequestDataAsync<Record<string, unknown>>();
	const project_id = String(request_data.project_id ?? "").trim();
	if (!project_id) {
		return ApiRes.validationError("Project id is required.");
	}

	const parsed_patch_payload = parse_project_patch_payload(request_data);
	if (!parsed_patch_payload.value) {
		return ApiRes.validationError(parsed_patch_payload.error ?? "Invalid patch payload.");
	}

	const updated_project = await updateProject(db, project_id, parsed_patch_payload.value);

	if (!updated_project) {
		return ApiRes.error("Project not found.", 404, "not_found");
	}

	return ApiRes.ok(updated_project);
}
