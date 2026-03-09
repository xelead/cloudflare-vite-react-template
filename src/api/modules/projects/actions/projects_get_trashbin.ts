import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import { type IProjectList } from "@src/api/modules/projects/project_types.ts";
import { getTrashBinProjects } from "@src/api/modules/projects/projects_store.ts";

export const route = {
	method: "get",
	path: "/api/projects/trashbin",
} as const;

type ProjectsGetTrashBinRequest = {
	pageNumber?: number | string;
	pageSize?: number | string;
	page_number?: number | string;
	page_size?: number | string;
	search?: string;
	status?: string;
};

export default async function projectsGetTrashBin(
	_context: IApiRequestContext,
): Promise<IApiResult<IProjectList>> {
	const db = await _context.getCoreDbAsync();
	const request_data = await _context.getRequestDataAsync<ProjectsGetTrashBinRequest>();
	const page_number_raw = request_data.pageNumber ?? request_data.page_number;
	const page_size_raw = request_data.pageSize ?? request_data.page_size;
	const page_number = page_number_raw !== undefined ? Number(page_number_raw) : undefined;
	const page_size = page_size_raw !== undefined ? Number(page_size_raw) : undefined;
	const { list, total } = await getTrashBinProjects(db, {
		pageNumber: page_number,
		pageSize: page_size,
		search: request_data.search?.trim(),
		status: request_data.status?.trim(),
	});

	return ApiRes.ok({
		list,
		total,
		pageNumber: page_number,
		pageSize: page_size,
	});
}
