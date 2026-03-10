import type { Db, Filter } from "mongodb";
import type { IEntityInfo } from "@src/common/crud/entity_interfaces.ts";

const now = () => new Date().toISOString();

/**
 * Slugifies a string for use as an ID
 */
function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Gets the editable fields from entity info
 */
function get_editable_field_names(entity_info: IEntityInfo): string[] {
	return entity_info.fields
		.filter(
			(field) =>
				!field.isReadOnly &&
				field.name !== "id" &&
				field.name !== "created_at" &&
				field.name !== "updated_at" &&
				field.name !== "deleted_at",
		)
		.map((field) => field.name);
}

/**
 * Checks if entity has a timestamp field
 */
function has_field(entity_info: IEntityInfo, field_name: string): boolean {
	return entity_info.fields.some((f) => f.name === field_name);
}

/**
 * Input type for list operations
 */
export type EntityListInput = {
	pageNumber?: number;
	pageSize?: number;
	search?: string;
	status?: string;
	filter?: Record<string, unknown>;
};

/**
 * Generic entity store that works entirely from entity metadata
 */
export function create_entity_store<T = Record<string, unknown>>(entity_info: IEntityInfo) {
	const collection_name = entity_info.storage.tableName;
	const id_field_name = entity_info.idFieldName;
	const display_name_field = entity_info.displayNameFieldName;

	/**
	 * Gets the MongoDB repository
	 */
	async function get_repo(db: Db) {
		const { default: MongoDbRepo } = await import("@src/api/fw/db/mongo_repo.ts");
		return new MongoDbRepo<Record<string, unknown>, T, Partial<T>, string>(db, collection_name);
	}

	/**
	 * Generates a unique ID for a new record
	 */
	function generate_id(input: Record<string, unknown>): string {
		const provided_id = input[id_field_name];
		if (typeof provided_id === "string" && provided_id.trim()) {
			return slugify(provided_id);
		}

		const display_value = input[display_name_field];
		if (typeof display_value === "string" && display_value.trim()) {
			const generated_id = slugify(display_value);
			return generated_id.length > 0 ? generated_id : `${entity_info.resourceCode}-${Date.now()}`;
		}

		return `${entity_info.resourceCode}-${Date.now()}`;
	}

	/**
	 * Prepares a record for creation with timestamps and generated ID
	 */
	function prepare_for_create(input: Record<string, unknown>): T {
		const timestamp = now();
		const editable_fields = get_editable_field_names(entity_info);

		const record: Record<string, unknown> = {
			[id_field_name]: generate_id(input),
		};

		// Copy editable fields
		for (const field_name of editable_fields) {
			if (input[field_name] !== undefined) {
				record[field_name] = input[field_name];
			}
		}

		// Add timestamps if fields exist
		if (has_field(entity_info, "created_at")) {
			record.created_at = timestamp;
		}
		if (has_field(entity_info, "updated_at")) {
			record.updated_at = timestamp;
		}
		if (has_field(entity_info, "deleted_at")) {
			record.deleted_at = null;
		}

		return record as T;
	}

	/**
	 * Prepares a record for update with timestamp
	 */
	function prepare_for_update(patch: Partial<T>): Partial<T> {
		const update_data: Record<string, unknown> = { ...patch };

		if (has_field(entity_info, "updated_at")) {
			update_data.updated_at = now();
		}

		// Remove undefined values
		for (const key of Object.keys(update_data)) {
			if (update_data[key] === undefined) {
				delete update_data[key];
			}
		}

		return update_data as Partial<T>;
	}

	/**
	 * Gets all records with optional filtering and pagination
	 */
	async function get_all(db: Db, input?: EntityListInput): Promise<{ list: T[]; total: number }> {
		const page_number = Math.max(1, Number(input?.pageNumber) || 1);
		const page_size = Math.max(1, Number(input?.pageSize) || entity_info.storage.defaultPageSize);
		const repo = await get_repo(db);

		const query: Record<string, unknown> = {};

		// Apply filter
		if (input?.filter) {
			Object.assign(query, input.filter);
		}

		// Apply status filter if provided
		if (input?.status) {
			query.status = input.status;
		}

		let items = await repo.find(query);

		// Apply search if provided
		if (input?.search) {
			const search = input.search.trim().toLowerCase();
			const searchable_fields = entity_info.fields.filter(
				(f) => f.jsonDataType === "string" && !f.isReadOnly,
			);

			items = items.filter((item) =>
				searchable_fields.some((field) => {
					const value = (item as Record<string, unknown>)[field.name];
					return typeof value === "string" && value.toLowerCase().includes(search);
				}),
			);
		}

		// Apply default sort
		const sort_column = entity_info.storage.defaultSort?.[0];
		if (sort_column) {
			items = items.sort((a, b) => {
				const a_val = (a as Record<string, unknown>)[sort_column.columnName];
				const b_val = (b as Record<string, unknown>)[sort_column.columnName];
				if (typeof a_val === "string" && typeof b_val === "string") {
					return sort_column.dir === "desc" ? b_val.localeCompare(a_val) : a_val.localeCompare(b_val);
				}
				return 0;
			});
		}

		const total = items.length;
		const start = (page_number - 1) * page_size;
		const end = start + page_size;

		return { list: items.slice(start, end), total };
	}

	/**
	 * Gets deleted records (trash bin)
	 */
	async function get_trashbin(
		db: Db,
		input?: { pageNumber?: number; pageSize?: number; search?: string; status?: string },
	): Promise<{ list: T[]; total: number }> {
		const page_number = Math.max(1, Number(input?.pageNumber) || 1);
		const page_size = Math.max(1, Number(input?.pageSize) || entity_info.storage.defaultPageSize);
		const collection = db.collection(collection_name);

		const query: Filter<unknown> = { deleted_at: { $ne: null } } as Filter<unknown>;

		// Apply status filter if provided
		if (input?.status) {
			(query as Record<string, unknown>).status = input.status;
		}

		let items = (await collection.find(query).toArray()) as T[];

		if (input?.search) {
			const search = input.search.trim().toLowerCase();
			const searchable_fields = entity_info.fields.filter(
				(f) => f.jsonDataType === "string" && !f.isReadOnly,
			);

			items = items.filter((item) =>
				searchable_fields.some((field) => {
					const value = (item as Record<string, unknown>)[field.name];
					return typeof value === "string" && value.toLowerCase().includes(search);
				}),
			);
		}

		const total = items.length;
		const start = (page_number - 1) * page_size;
		const end = start + page_size;

		return { list: items.slice(start, end), total };
	}

	/**
	 * Gets a single record by ID
	 */
	async function get_by_id(db: Db, id: string): Promise<T | null> {
		const repo = await get_repo(db);
		return repo.findOne({ [id_field_name]: id } as Record<string, unknown>);
	}

	/**
	 * Creates a new record
	 */
	async function create(db: Db, input: Record<string, unknown>): Promise<T> {
		const repo = await get_repo(db);
		const record = prepare_for_create(input);

		// Check for duplicate ID
		const record_id = (record as Record<string, unknown>)[id_field_name] as string;
		const duplicate = await repo.findOne({ [id_field_name]: record_id } as Record<string, unknown>);
		if (duplicate) {
			throw { code: 409, errorType: "conflict", message: `${entity_info.entityName} id already exists.` };
		}

		const result = await repo.create(record as unknown as Record<string, unknown> & { _id: unknown });
		if (!result.isSuccessful) {
			throw { code: 500, errorType: "db_error", message: `Failed to create ${entity_info.entityName.toLowerCase()}.` };
		}

		return record;
	}

	/**
	 * Updates a record
	 */
	async function update(db: Db, id: string, patch: Partial<T>): Promise<T | null> {
		const repo = await get_repo(db);
		const update_data = prepare_for_update(patch);

		const current = await repo.findOne({ [id_field_name]: id } as Record<string, unknown>);
		if (!current) return null;

		const result = await repo.updateOne({ [id_field_name]: id } as Record<string, unknown>, update_data);
		if (!result.isSuccessful) {
			throw { code: 500, errorType: "db_error", message: `Failed to update ${entity_info.entityName.toLowerCase()}.` };
		}

		return repo.findOne({ [id_field_name]: id } as Record<string, unknown>);
	}

	/**
	 * Soft deletes a record
	 */
	async function soft_delete(db: Db, id: string): Promise<T | null> {
		const repo = await get_repo(db);
		const current = await repo.findOne({ [id_field_name]: id } as Record<string, unknown>);
		if (!current) return null;

		const timestamp = now();
		const update_data: Record<string, unknown> = {};

		if (has_field(entity_info, "deleted_at")) {
			update_data.deleted_at = timestamp;
		}
		if (has_field(entity_info, "updated_at")) {
			update_data.updated_at = timestamp;
		}

		const result = await repo.updateOne({ [id_field_name]: id } as Record<string, unknown>, update_data as Partial<T>);
		if (!result.isSuccessful) {
			throw { code: 500, errorType: "db_error", message: `Failed to delete ${entity_info.entityName.toLowerCase()}.` };
		}

		return { ...current, ...update_data } as T;
	}

	return {
		get_all,
		get_trashbin,
		get_by_id,
		create,
		update,
		soft_delete,
		get_repo,
		prepare_for_create,
		prepare_for_update,
		generate_id,
	};
}