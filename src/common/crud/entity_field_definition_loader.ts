import { EntityFieldMaker } from "@src/common/crud/entity_field_maker.ts";
import type { IEntityFieldInfo } from "@src/common/crud/entity_interfaces.ts";

type FieldFactoryName =
	| "getId"
	| "getCode"
	| "getTitle"
	| "getString"
	| "getBoolean"
	| "getStringArray"
	| "getSchemaVersion"
	| "getInt32"
	| "getLatLng"
	| "getInt64Field"
	| "getFloatField"
	| "getDate"
	| "getCreatedAt"
	| "getUpdatedAt"
	| "getCreatedBy"
	| "getUpdatedBy"
	| "getNotes"
	| "getNotedBy"
	| "getNotedAt";

export interface EntityFieldDefinitionJson {
	key: string;
	factory: FieldFactoryName;
	args?: unknown[];
	extra_props?: Partial<IEntityFieldInfo>;
}

type FieldFactoryFn = (...args: unknown[]) => IEntityFieldInfo;

const field_factories: Record<FieldFactoryName, FieldFactoryFn> = {
	getId: () => EntityFieldMaker.getId(),
	getCode: () => EntityFieldMaker.getCode(),
	getTitle: () => EntityFieldMaker.getTitle(),
	getString: (...args) => EntityFieldMaker.getString(...(args as [string, string, Partial<IEntityFieldInfo>?])),
	getBoolean: (...args) =>
		EntityFieldMaker.getBoolean(...(args as [string, string, Partial<IEntityFieldInfo>?])),
	getStringArray: (...args) => EntityFieldMaker.getStringArray(...(args as [string, string])),
	getSchemaVersion: () => EntityFieldMaker.getSchemaVersion(),
	getInt32: (...args) => EntityFieldMaker.getInt32(...(args as [string, string])),
	getLatLng: (...args) => EntityFieldMaker.getLatLng(...(args as [string, string])),
	getInt64Field: (...args) => EntityFieldMaker.getInt64Field(...(args as [string, string])),
	getFloatField: (...args) => EntityFieldMaker.getFloatField(...(args as [string, string])),
	getDate: (...args) => EntityFieldMaker.getDate(...(args as [string, string])),
	getCreatedAt: () => EntityFieldMaker.getCreatedAt(),
	getUpdatedAt: () => EntityFieldMaker.getUpdatedAt(),
	getCreatedBy: () => EntityFieldMaker.getCreatedBy(),
	getUpdatedBy: () => EntityFieldMaker.getUpdatedBy(),
	getNotes: () => EntityFieldMaker.getNotes(),
	getNotedBy: () => EntityFieldMaker.getNotedBy(),
	getNotedAt: () => EntityFieldMaker.getNotedAt(),
};

function merge_field_overrides(
	base_field: IEntityFieldInfo,
	overrides: Partial<IEntityFieldInfo>,
): IEntityFieldInfo {
	return {
		...base_field,
		...overrides,
		formFieldProps: {
			...base_field.formFieldProps,
			...overrides.formFieldProps,
		},
		listFieldProps: {
			...base_field.listFieldProps,
			...overrides.listFieldProps,
		},
		editorProps: overrides.editorProps ?? base_field.editorProps,
	};
}

function build_single_field(definition: EntityFieldDefinitionJson): IEntityFieldInfo {
	const field_factory = field_factories[definition.factory];
	const factory_args = definition.args ?? [];
	const base_field = field_factory(...factory_args);

	if (!definition.extra_props) {
		return base_field;
	}

	return merge_field_overrides(base_field, definition.extra_props);
}

export function build_entity_fields_from_json(
	definitions: EntityFieldDefinitionJson[],
): Record<string, IEntityFieldInfo> {
	const fields: Record<string, IEntityFieldInfo> = {};

	for (const definition of definitions) {
		fields[definition.key] = build_single_field(definition);
	}

	return fields;
}
