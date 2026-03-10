/**
 * Generic Entity API Actions
 *
 * Factory functions that create API route handlers from entity metadata.
 * All CRUD logic is driven by the entity configuration.
 */

import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";
import type { IEntityInfo } from "@src/common/crud/entity_interfaces.ts";
import { create_entity_store, type EntityListInput } from "@src/common/crud/entity_store.ts";
import { create_entity_parser } from "@src/common/crud/entity_request_parser.ts";

type ListResult<T> = {
	list: T[];
	total: number;
	pageNumber?: number;
	pageSize?: number;
};

type ListRequest = {
	pageNumber?: number | string;
	pageSize?: number | string;
	page_number?: number | string;
	page_size?: number | string;
	search?: string;
	status?: string;
};

type LookupRequest = {
	[id_field: string]: string | undefined;
};

/**
 * Creates a GET list endpoint handler
 */
export function create_list_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);

	return async function list_action(
		context: IApiRequestContext,
	): Promise<IApiResult<ListResult<T>>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<ListRequest>();
		const page_number_raw = request_data.pageNumber ?? request_data.page_number;
		const page_size_raw = request_data.pageSize ?? request_data.page_size;
		const page_number = page_number_raw !== undefined ? Number(page_number_raw) : undefined;
		const page_size = page_size_raw !== undefined ? Number(page_size_raw) : undefined;

		const input: EntityListInput = {
			pageNumber: page_number,
			pageSize: page_size,
			search: request_data.search?.trim(),
			status: request_data.status?.trim(),
		};

		const { list, total } = await store.get_all(db, input);

		return ApiRes.ok({
			list,
			total,
			pageNumber: page_number,
			pageSize: page_size,
		});
	};
}

/**
 * Creates a GET by ID endpoint handler
 */
export function create_get_by_id_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);
	const id_field = entity_info.idFieldName;

	return async function get_by_id_action(
		context: IApiRequestContext,
	): Promise<IApiResult<T | null>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<LookupRequest>();
		const entity_id = request_data[id_field]?.trim();

		if (!entity_id) {
			return ApiRes.validationError(`${entity_info.entityName} id is required.`);
		}

		const entity = await store.get_by_id(db, entity_id);
		if (!entity) {
			return ApiRes.error(`${entity_info.entityName} not found.`, 404, "not_found");
		}

		return ApiRes.ok(entity);
	};
}

/**
 * Creates a GET metadata endpoint handler
 */
export function create_get_meta_action<TMeta extends { entityInfo: { fields: unknown[] } }>(
	_entity_info: IEntityInfo,
	get_meta_fn: () => TMeta,
) {
	return async function get_meta_action(
		_context: IApiRequestContext,
	): Promise<IApiResult<TMeta>> {
		return ApiRes.ok(get_meta_fn());
	};
}

/**
 * Creates a GET trashbin endpoint handler
 */
export function create_get_trashbin_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);

	return async function get_trashbin_action(
		context: IApiRequestContext,
	): Promise<IApiResult<ListResult<T>>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<ListRequest>();
		const page_number_raw = request_data.pageNumber ?? request_data.page_number;
		const page_size_raw = request_data.pageSize ?? request_data.page_size;
		const page_number = page_number_raw !== undefined ? Number(page_number_raw) : undefined;
		const page_size = page_size_raw !== undefined ? Number(page_size_raw) : undefined;

		const { list, total } = await store.get_trashbin(db, {
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
	};
}

/**
 * Creates a POST create endpoint handler
 */
export function create_create_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);
	const parser = create_entity_parser(entity_info);

	return async function create_action(
		context: IApiRequestContext,
	): Promise<IApiResult<T | null>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<Record<string, unknown>>();
		const parsed = parser.parseCreate(request_data);

		if (!parsed.value) {
			return ApiRes.validationError(
				parsed.error ?? `Invalid payload for ${entity_info.entityName.toLowerCase()} creation.`,
				parsed.debug_details,
			);
		}

		const entity = await store.create(db, parsed.value);

		return {
			...ApiRes.ok(entity as T),
			code: 201,
		};
	};
}

/**
 * Creates a PATCH update endpoint handler
 */
export function create_patch_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);
	const parser = create_entity_parser(entity_info);
	const id_field = entity_info.idFieldName;

	return async function patch_action(
		context: IApiRequestContext,
	): Promise<IApiResult<T | null>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<Record<string, unknown>>();
		const entity_id = String(request_data[id_field] ?? "").trim();

		if (!entity_id) {
			return ApiRes.validationError(`${entity_info.entityName} id is required.`);
		}

		const parsed = parser.parsePatch(request_data);
		if (!parsed.value) {
			return ApiRes.validationError(
				parsed.error ?? "Invalid patch payload.",
				parsed.debug_details,
			);
		}

		const updated = await store.update(db, entity_id, parsed.value as Partial<T>);

		if (!updated) {
			return ApiRes.error(`${entity_info.entityName} not found.`, 404, "not_found");
		}

		return ApiRes.ok(updated);
	};
}

/**
 * Creates a DELETE soft-delete endpoint handler
 */
export function create_soft_delete_action<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const store = create_entity_store<T>(entity_info);
	const id_field = entity_info.idFieldName;

	return async function soft_delete_action(
		context: IApiRequestContext,
	): Promise<IApiResult<T | null>> {
		const db = await context.getCoreDbAsync();
		const request_data = await context.getRequestDataAsync<LookupRequest>();
		const entity_id = request_data[id_field]?.trim();

		if (!entity_id) {
			return ApiRes.validationError(`${entity_info.entityName} id is required.`);
		}

		const deleted = await store.soft_delete(db, entity_id);
		if (!deleted) {
			return ApiRes.error(`${entity_info.entityName} not found.`, 404, "not_found");
		}

		return ApiRes.ok(deleted);
	};
}

/**
 * Route definition helper - creates consistent route objects
 */
export function define_route(method: "get" | "post" | "patch" | "delete" | "put", path: string) {
	return { method, path } as const;
}