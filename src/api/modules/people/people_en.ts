import type {
	IEntityAction,
	IEntityFieldInfo,
	IEntityInfo,
	IEntityStorageInfo,
} from "@src/common/crud/entity_interfaces.ts";
import { PEOPLE_FIELDS, PEOPLE_FIELD_ORDER } from "@src/api/modules/people/people_types.ts";

export const entity_res_code = "people";

const people_storage: IEntityStorageInfo = {
	dbName: "core",
	tableName: "people",
	viewName: "people",
	defaultFilter: null,
	defaultSort: [{ columnName: "updated_at", dir: "desc" }],
	defaultPageSize: 10,
};

// Build ordered fields array from typed definitions
const people_fields: IEntityFieldInfo[] = PEOPLE_FIELD_ORDER.map(
	(key) => PEOPLE_FIELDS[key],
);
const people_fields_by_name = people_fields.reduce<Record<string, IEntityFieldInfo>>(
	(acc, field) => {
		acc[field.name] = field;
		return acc;
	},
	{},
);

// Computed from field metadata - used internally for entity actions
const people_editable_fields = people_fields.filter(
	(field) =>
		!field.isReadOnly &&
		field.name !== "id" &&
		field.name !== "created_at" &&
		field.name !== "updated_at" &&
		field.name !== "deleted_at",
);

const create_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "create",
	actionTitle: "Create Person",
	actionIcon: "",
	fieldNames: people_editable_fields.map((field) => field.name),
};

const update_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "update",
	actionTitle: "Update Person",
	actionIcon: "",
	fieldNames: people_editable_fields.map((field) => field.name),
};

const delete_entity_action: IEntityAction = {
	entityResCode: entity_res_code,
	actionName: "delete",
	actionTitle: "Delete Person",
	actionIcon: "",
	fieldNames: ["id"],
};

export const entity_info: IEntityInfo = {
	entityNs: "mem",
	entityName: "Person",
	entityAdk: "",
	resourceCode: entity_res_code,
	storage: people_storage,
	idFieldName: people_fields_by_name.id?.name ?? "id",
	codeFieldName: people_fields_by_name.id?.name ?? "id",
	displayNameFieldName: people_fields_by_name.name?.name ?? "name",
	entityTitle: "People",
	fields: people_fields,
	apiActions: [create_entity_action, update_entity_action, delete_entity_action],
};

type PersonClientField = Pick<
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

export function get_people_entity_meta() {
	const client_fields: PersonClientField[] = people_fields.map((field) => ({
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
		entityNs: entity_info.entityNs,
		entityName: entity_info.entityName,
		resourceCode: entity_info.resourceCode,
		displayNameFieldName: entity_info.displayNameFieldName,
		entityTitle: entity_info.entityTitle,
		fields: client_fields,
	};
}
