import project_fields_json from "@src/api/modules/projects/project_fields.json" assert { type: "json" };
import {
	build_entity_fields_from_json,
	type EntityFieldDefinitionJson,
} from "@src/common/crud/entity_field_definition_loader.ts";
import type {
	IEntityAction,
	IEntityFieldInfo,
	IEntityInfo,
	IEntityStorageInfo,
} from "@src/common/crud/entity_interfaces.ts";

export const entity_res_code = "projects";

const project_storage: IEntityStorageInfo = {
	dbName: "core",
	tableName: "projects",
	viewName: "projects",
	defaultFilter: null,
	defaultSort: [{ columnName: "updated_at", dir: "desc" }],
	defaultPageSize: 10,
};

const project_field_definitions = project_fields_json as EntityFieldDefinitionJson[];
const project_fields_map = build_entity_fields_from_json(project_field_definitions);

export const project_field_keys = project_field_definitions.map((definition) => definition.key);
export const project_fields = project_field_keys.map((field_key) => project_fields_map[field_key]);
export const project_fields_by_name = project_fields.reduce<Record<string, IEntityFieldInfo>>(
	(acc, field) => {
		acc[field.name] = field;
		return acc;
	},
	{},
);

export const project_editable_fields = project_fields.filter(
	(field) =>
		!field.isReadOnly &&
		field.name !== "id" &&
		field.name !== "created_at" &&
		field.name !== "updated_at" &&
		field.name !== "deleted_at",
);
export const project_required_fields = project_editable_fields.filter((field) => field.isRequired);

const create_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "create",
	actionTitle: "Create Project",
	actionIcon: "",
	fieldNames: project_editable_fields.map((field) => field.name),
};

const update_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "update",
	actionTitle: "Update Project",
	actionIcon: "",
	fieldNames: project_editable_fields.map((field) => field.name),
};

const delete_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "delete",
	actionTitle: "Delete Project",
	actionIcon: "",
	fieldNames: ["id"],
};

export const entity_info: IEntityInfo = {
	entityNs: "mem",
	entityName: "Project",
	entityAdk: "",
	resourceCode: entity_res_code,
	storage: project_storage,
	idFieldName: project_fields_by_name.id?.name ?? "id",
	codeFieldName: project_fields_by_name.id?.name ?? "id",
	displayNameFieldName: project_fields_by_name.name?.name ?? "name",
	entityTitle: "Projects",
	fields: project_fields,
	apiActions: [create_entity_action, update_entity_action, delete_entity_action],
};

type ProjectClientField = Pick<
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

export function get_project_entity_meta() {
	const client_fields: ProjectClientField[] = project_fields.map((field) => ({
		name: field.name,
		label: field.label,
		jsonDataType: field.jsonDataType,
		storageDataType: field.storageDataType,
		isRequired: field.isRequired,
		isReadOnly: field.isReadOnly,
		formFieldProps: field.formFieldProps,
		listFieldProps: field.listFieldProps,
	}));

	return {
		entityInfo: {
			entityNs: entity_info.entityNs,
			entityName: entity_info.entityName,
			resourceCode: entity_info.resourceCode,
			displayNameFieldName: entity_info.displayNameFieldName,
			entityTitle: entity_info.entityTitle,
			fields: client_fields,
		},
	};
}
