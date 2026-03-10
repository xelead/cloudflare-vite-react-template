import type { IEntityFieldInfo } from "@src/common/crud/entity_interfaces.ts";

/**
 * Renders a field value for display in lists and views.
 * Handles arrays, null, undefined, and other types.
 */
export function render_field_value(value: unknown): string {
	if (Array.isArray(value)) {
		return value.map((item) => String(item)).join(" · ");
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

/**
 * Client-side field metadata for UI rendering.
 * Simplified version of IEntityFieldInfo for client use.
 */
export type ClientEntityField = Pick<
	IEntityFieldInfo,
	| "name"
	| "label"
	| "jsonDataType"
	| "storageDataType"
	| "isRequired"
	| "isReadOnly"
	| "formFieldProps"
	| "listFieldProps"
>;

/**
 * Field info type that works with both full and client-side field metadata.
 */
export type FieldInfo = IEntityFieldInfo | ClientEntityField;

/**
 * Converts a field value to a string suitable for form input.
 * Handles different field types (string, number, array, boolean).
 */
export function to_input_value(value: unknown, field: FieldInfo): string {
	if (value === undefined || value === null) {
		return "";
	}

	if (field.jsonDataType === "array" && Array.isArray(value)) {
		return value.map((item) => String(item)).join(", ");
	}

	if (field.jsonDataType === "boolean") {
		return value ? "true" : "false";
	}

	return String(value);
}

/**
 * Checks if two string arrays are equal.
 */
function are_string_arrays_equal(left: string[], right: string[]): boolean {
	if (left.length !== right.length) {
		return false;
	}

	for (let index = 0; index < left.length; index += 1) {
		if (left[index] !== right[index]) {
			return false;
		}
	}

	return true;
}

/**
 * Parses a string input value based on field type.
 * Returns the parsed value or an error message.
 */
export function parse_field_input(
	value: string,
	field: FieldInfo,
): { value?: unknown; error?: string } {
	if (field.jsonDataType === "number") {
		const parsed_number = Number(value);
		if (!Number.isFinite(parsed_number)) {
			return { error: `${field.label} must be a valid number.` };
		}

		if (
			(field.storageDataType === "int" || field.storageDataType === "int64") &&
			!Number.isInteger(parsed_number)
		) {
			return { error: `${field.label} must be an integer.` };
		}

		return { value: parsed_number };
	}

	if (field.jsonDataType === "array") {
		return {
			value: value
				.split(",")
				.map((item) => item.trim())
				.filter((item) => item.length > 0),
		};
	}

	if (field.jsonDataType === "boolean") {
		return { value: value === "true" || value === "1" };
	}

	return { value: value.trim() };
}

/**
 * Builds form state from an entity record.
 * Converts entity values to string form values.
 */
export function build_form_state<T extends Record<string, unknown>>(
	entity: T,
	form_fields: FieldInfo[],
): Record<string, string> {
	const form_state: Record<string, string> = {};

	for (const field of form_fields) {
		form_state[field.name] = to_input_value(entity[field.name as keyof T], field);
	}

	return form_state;
}

type ParsedPatch<T> = {
	patch?: Partial<T>;
	error?: string;
};

/**
 * Computes the changed fields between an entity and form state.
 * Returns a patch object with only changed values, or an error message.
 */
export function get_changed_patch_payload<T extends Record<string, unknown>>(
	entity: T,
	form_state: Record<string, string>,
	form_fields: FieldInfo[],
): ParsedPatch<T> {
	const patch: Record<string, unknown> = {};

	for (const field of form_fields) {
		const raw_value = form_state[field.name] ?? "";
		const parsed = parse_field_input(raw_value, field);
		if (parsed.error) {
			return { error: parsed.error };
		}

		if (field.isRequired) {
			if (field.jsonDataType === "array") {
				if (!Array.isArray(parsed.value) || parsed.value.length === 0) {
					return { error: `${field.label} is required.` };
				}
			} else if (String(parsed.value ?? "").trim() === "") {
				return { error: `${field.label} is required.` };
			}
		}

		const current_value = entity[field.name as keyof T];
		if (field.jsonDataType === "array") {
			const next_array = Array.isArray(parsed.value)
				? parsed.value.map((item) => String(item))
				: [];
			const current_array = Array.isArray(current_value)
				? current_value.map((item) => String(item))
				: [];
			if (!are_string_arrays_equal(next_array, current_array)) {
				patch[field.name] = next_array;
			}
			continue;
		}

		// Handle string fields that may be empty
		if (field.jsonDataType === "string") {
			const current_string = String(current_value ?? "").trim();
			const next_string = String(parsed.value ?? "").trim();
			if (next_string !== current_string) {
				patch[field.name] = next_string.length > 0 ? next_string : "";
			}
			continue;
		}

		if (parsed.value !== current_value) {
			patch[field.name] = parsed.value;
		}
	}

	return { patch: patch as Partial<T> };
}

/**
 * Client-side entity metadata for UI rendering.
 */
export interface ClientEntityMeta {
	entityNs: string;
	entityName: string;
	resourceCode: string;
	displayNameFieldName: string;
	entityTitle: string;
	fields: ClientEntityField[];
}

/**
 * API response wrapper for entity metadata.
 */
export interface EntityMetaApiResponse {
	success: boolean;
	message?: string;
	data?: ClientEntityMeta;
}