import type { IEntityFieldInfo, IEntityInfo } from "@src/common/crud/entity_interfaces.ts";

export type ParseResult<T> = {
	value?: T;
	error?: string;
	debug_details?: {
		invalid_fields?: string[];
		missing_fields?: string[];
		field_errors?: Record<string, string>;
	};
};

/**
 * Normalizes a string value by trimming whitespace
 */
function normalize_string(value: unknown): string {
	return String(value ?? "").trim();
}

/**
 * Normalizes a string array value - handles both arrays and comma-separated strings
 */
function normalize_string_array(value: unknown): string[] {
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

/**
 * Parses a number value with optional integer validation
 */
function parse_number(value: unknown, field: IEntityFieldInfo): ParseResult<number> {
	const numeric_value = Number(value);
	if (!Number.isFinite(numeric_value)) {
		return { error: `${field.label} must be a valid number.` };
	}

	if (
		(field.storageDataType === "int" || field.storageDataType === "int64") &&
		!Number.isInteger(numeric_value)
	) {
		return { error: `${field.label} must be an integer.` };
	}

	return { value: numeric_value };
}

/**
 * Parses a single field value based on its jsonDataType
 */
function parse_field_value(value: unknown, field: IEntityFieldInfo): ParseResult<unknown> {
	// Use custom validate if provided
	if (field.customValidate) {
		const custom_error = field.customValidate(value);
		if (custom_error) {
			return { error: custom_error };
		}
	}

	switch (field.jsonDataType) {
		case "number":
			return parse_number(value, field);
		case "array":
			return { value: normalize_string_array(value) };
		case "boolean":
			return { value: Boolean(value) };
		case "string":
		default:
			return { value: normalize_string(value) };
	}
}

/**
 * Gets editable fields from entity info (excludes read-only and system fields)
 */
export function get_editable_fields(entity_info: IEntityInfo): IEntityFieldInfo[] {
	return entity_info.fields.filter(
		(field) =>
			!field.isReadOnly &&
			field.name !== "id" &&
			field.name !== "created_at" &&
			field.name !== "updated_at" &&
			field.name !== "deleted_at",
	);
}

/**
 * Gets required fields from editable fields
 */
export function get_required_fields(editable_fields: IEntityFieldInfo[]): IEntityFieldInfo[] {
	return editable_fields.filter((field) => field.isRequired);
}

/**
 * Validates that all required fields are present in the payload
 * Returns missing field labels and names
 */
function validate_required_fields(
	payload: Record<string, unknown>,
	required_fields: IEntityFieldInfo[],
): { missing_labels: string[]; missing_names: string[] } {
	const missing_labels: string[] = [];
	const missing_names: string[] = [];

	for (const field of required_fields) {
		const value = payload[field.name];
		if (field.jsonDataType === "array") {
			if (!Array.isArray(value) || value.length === 0) {
				missing_labels.push(field.label);
				missing_names.push(field.name);
			}
			continue;
		}

		if (value === undefined || value === null || String(value).trim() === "") {
			missing_labels.push(field.label);
			missing_names.push(field.name);
		}
	}

	return { missing_labels, missing_names };
}

/**
 * Normalizes optional empty string fields to undefined
 * This handles fields that are optional but may come as empty strings from forms
 */
function normalize_optional_empty_fields(
	payload: Record<string, unknown>,
	editable_fields: IEntityFieldInfo[],
): void {
	for (const field of editable_fields) {
		if (field.isRequired) continue;
		if (!Object.prototype.hasOwnProperty.call(payload, field.name)) continue;

		if (field.jsonDataType === "string") {
			const string_value = String(payload[field.name] ?? "").trim();
			payload[field.name] = string_value.length > 0 ? string_value : undefined;
		}
	}
}

/**
 * Generic parse function for create payloads
 * Works entirely from entity field metadata
 */
export function parse_create_payload(
	request_data: Record<string, unknown>,
	entity_info: IEntityInfo,
): ParseResult<Record<string, unknown>> {
	const editable_fields = get_editable_fields(entity_info);
	const required_fields = get_required_fields(editable_fields);
	const payload: Record<string, unknown> = {};
	const field_errors: Record<string, string> = {};

	// Handle id field if present in request
	const id_field = entity_info.fields.find((f) => f.name === entity_info.idFieldName);
	const raw_id = request_data[id_field?.name ?? "id"];
	if (raw_id !== undefined && id_field) {
		payload[id_field.name] = normalize_string(raw_id);
	}

	// Parse all editable fields
	for (const field of editable_fields) {
		const raw_value = request_data[field.name];
		if (raw_value === undefined) {
			continue;
		}

		const parsed = parse_field_value(raw_value, field);
		if (parsed.error) {
			field_errors[field.name] = parsed.error;
		} else {
			payload[field.name] = parsed.value;
		}
	}

	// Check for field-level validation errors first
	if (Object.keys(field_errors).length > 0) {
		const invalid_field_names = Object.keys(field_errors);
		const error_messages = Object.values(field_errors);
		return {
			error: error_messages.length === 1 ? error_messages[0] : `Invalid fields: ${invalid_field_names.join(", ")}`,
			debug_details: {
				invalid_fields: invalid_field_names,
				field_errors,
			},
		};
	}

	// Validate required fields
	const { missing_labels, missing_names } = validate_required_fields(payload, required_fields);
	if (missing_labels.length > 0) {
		return {
			error: `Missing required fields: ${missing_labels.join(", ")}.`,
			debug_details: {
				missing_fields: missing_names,
			},
		};
	}

	// Normalize optional empty fields to undefined
	normalize_optional_empty_fields(payload, editable_fields);

	return { value: payload };
}

/**
 * Generic parse function for patch/update payloads
 * Works entirely from entity field metadata
 */
export function parse_patch_payload(
	request_data: Record<string, unknown>,
	entity_info: IEntityInfo,
): ParseResult<Record<string, unknown>> {
	const editable_fields = get_editable_fields(entity_info);
	const patch_payload: Record<string, unknown> = {};
	const field_errors: Record<string, string> = {};

	for (const field of editable_fields) {
		if (!Object.prototype.hasOwnProperty.call(request_data, field.name)) {
			continue;
		}

		const parsed = parse_field_value(request_data[field.name], field);
		if (parsed.error) {
			field_errors[field.name] = parsed.error;
		} else {
			patch_payload[field.name] = parsed.value;
		}
	}

	// Check for field-level validation errors
	if (Object.keys(field_errors).length > 0) {
		const invalid_field_names = Object.keys(field_errors);
		const error_messages = Object.values(field_errors);
		return {
			error: error_messages.length === 1 ? error_messages[0] : `Invalid fields: ${invalid_field_names.join(", ")}`,
			debug_details: {
				invalid_fields: invalid_field_names,
				field_errors,
			},
		};
	}

	// Normalize optional empty fields to undefined
	normalize_optional_empty_fields(patch_payload, editable_fields);

	return { value: patch_payload };
}

/**
 * Creates a parser instance for a specific entity
 * This provides a convenient way to create entity-specific parsers with pre-bound entity info
 */
export function create_entity_parser(entity_info: IEntityInfo) {
	return {
		parseCreate: (request_data: Record<string, unknown>) => parse_create_payload(request_data, entity_info),
		parsePatch: (request_data: Record<string, unknown>) => parse_patch_payload(request_data, entity_info),
		getEditableFields: () => get_editable_fields(entity_info),
		getRequiredFields: () => get_required_fields(get_editable_fields(entity_info)),
	};
}