import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { createProject } from "@src/api/modules/projects/projects_store.ts";
import { parse_project_create_payload } from "@src/api/modules/projects/project_request_parser.ts";

export const route = {
	method: "post",
	path: "/api/projects",
} as const;

export default async function projectsCreate(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const db = await context.getCoreDbAsync();
	const request_data = await context.getRequestDataAsync<Record<string, unknown>>();
	const parsed_create_payload = parse_project_create_payload(request_data);
	if (!parsed_create_payload.value) {
		return ApiRes.validationError(
			parsed_create_payload.error ?? "Invalid payload for project creation.",
		);
	}

	const project = await createProject(db, parsed_create_payload.value);

	return {
		...ApiRes.ok(project),
		code: 201,
	};
}
