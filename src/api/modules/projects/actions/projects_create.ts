import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProject } from "@src/api/modules/projects/project_types.ts";
import { createProject } from "@src/api/modules/projects/projects_store.ts";

type ProjectCreateRequest = {
	id?: string;
	name?: string;
	summary?: string;
	year?: number | string;
	status?: string;
	stack?: string[] | string;
	link?: string;
};

function normalizeStack(value: ProjectCreateRequest["stack"]): string[] {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
	}

	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	return [];
}

export default async function projectsCreate(
	context: IApiRequestContext,
): Promise<IApiResult<IProject | null>> {
	const request_data = await context.getRequestDataAsync<ProjectCreateRequest>();
	const name = request_data.name?.trim();
	const summary = request_data.summary?.trim();
	const status = request_data.status?.trim();
	const stack = normalizeStack(request_data.stack);
	const year = Number(request_data.year);
	const link = request_data.link?.trim() || undefined;

	if (!name || !summary || !status || !Number.isInteger(year)) {
		return ApiRes.validationError("Missing required fields for project creation.");
	}

	const project = createProject({
		id: request_data.id?.trim(),
		name,
		summary,
		year,
		status,
		stack,
		link,
	});

	return {
		...ApiRes.ok(project),
		code: 201,
	};
}
