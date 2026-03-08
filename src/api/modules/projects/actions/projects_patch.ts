import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { updateProject } from "@src/api/modules/projects/projects_store.ts";

type ProjectPatchRequest = {
	project_id?: string;
	name?: string;
	summary?: string;
	year?: number | string;
	status?: string;
	stack?: string[] | string;
	link?: string;
};

function normalizeStack(value: ProjectPatchRequest["stack"]): string[] | undefined {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
	}

	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	return undefined;
}

export default async function projectsPatch(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const request_data = await context.getRequestDataAsync<ProjectPatchRequest>();
	const project_id = request_data.project_id?.trim();
	if (!project_id) {
		return ApiRes.validationError("Project id is required.");
	}

	const stack = normalizeStack(request_data.stack);
	const next_year =
		request_data.year !== undefined && request_data.year !== null
			? Number(request_data.year)
			: undefined;

	if (next_year !== undefined && !Number.isInteger(next_year)) {
		return ApiRes.validationError("Year must be an integer.");
	}

	const updated_project = updateProject(project_id, {
		name: request_data.name?.trim(),
		summary: request_data.summary?.trim(),
		year: next_year,
		status: request_data.status?.trim(),
		stack,
		link: request_data.link?.trim() || undefined,
	});

	if (!updated_project) {
		return ApiRes.error("Project not found.", 404, "not_found");
	}

	return ApiRes.ok(updated_project);
}
