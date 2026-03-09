import type { IProject } from "@src/api/modules/projects/project_types.ts";
import {
	project_editable_fields,
	project_fields_by_name,
	project_required_fields,
} from "@src/api/modules/projects/project_en.ts";
import type { IEntityFieldInfo } from "@src/common/crud/entity_interfaces.ts";

type ParseResult<T> = {
	value?: T;
	error?: string;
};

function normalize_string(value: unknown): string {
	return String(value ?? "").trim();
}

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

function parse_field_value(value: unknown, field: IEntityFieldInfo): ParseResult<unknown> {
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

function validate_required_fields(payload: Record<string, unknown>): string[] {
	const missing_labels: string[] = [];

	for (const field of project_required_fields) {
		const value = payload[field.name];
		if (field.jsonDataType === "array") {
			if (!Array.isArray(value) || value.length === 0) {
				missing_labels.push(field.label);
			}
			continue;
		}

		if (value === undefined || value === null || String(value).trim() === "") {
			missing_labels.push(field.label);
		}
	}

	return missing_labels;
}

function normalize_optional_link(payload: Record<string, unknown>) {
	if (!Object.prototype.hasOwnProperty.call(payload, "link")) {
		return;
	}

	const link_value = String(payload.link ?? "").trim();
	payload.link = link_value.length > 0 ? link_value : undefined;
}

export function parse_project_create_payload(
	request_data: Record<string, unknown>,
): ParseResult<{
	id?: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
}> {
	const payload: Record<string, unknown> = {};
	const id_field = project_fields_by_name.id;
	const raw_id = request_data[id_field?.name ?? "id"];
	if (raw_id !== undefined) {
		payload.id = normalize_string(raw_id);
	}

	for (const field of project_editable_fields) {
		const raw_value = request_data[field.name];
		if (raw_value === undefined) {
			continue;
		}

		const parsed = parse_field_value(raw_value, field);
		if (parsed.error) {
			return { error: parsed.error };
		}

		payload[field.name] = parsed.value;
	}

	const missing_labels = validate_required_fields(payload);
	if (missing_labels.length > 0) {
		return {
			error: `Missing required fields: ${missing_labels.join(", ")}.`,
		};
	}

	normalize_optional_link(payload);

	return {
		value: payload as {
			id?: string;
			name: string;
			summary: string;
			year: number;
			status: string;
			stack: string[];
			link?: string;
		},
	};
}

export function parse_project_patch_payload(
	request_data: Record<string, unknown>,
): ParseResult<Partial<Omit<IProject, "id" | "created_at">>> {
	const patch_payload: Record<string, unknown> = {};

	for (const field of project_editable_fields) {
		if (!Object.prototype.hasOwnProperty.call(request_data, field.name)) {
			continue;
		}

		const parsed = parse_field_value(request_data[field.name], field);
		if (parsed.error) {
			return { error: parsed.error };
		}

		patch_payload[field.name] = parsed.value;
	}

	normalize_optional_link(patch_payload);
	return { value: patch_payload as Partial<Omit<IProject, "id" | "created_at">> };
}
