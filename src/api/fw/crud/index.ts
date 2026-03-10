/**
 * CRUD Framework Exports
 *
 * Generic factories for creating entity routes and handlers.
 */

export {
	create_list_action,
	create_get_by_id_action,
	create_get_meta_action,
	create_get_trashbin_action,
	create_create_action,
	create_patch_action,
	create_soft_delete_action,
	define_route,
} from "./entity_api_actions.ts";

export { create_entity_store, type EntityListInput } from "@src/common/crud/entity_store.ts";
export { create_entity_parser, type ParseResult } from "@src/common/crud/entity_request_parser.ts";
export {
	build_entity_fields_from_json,
	type EntityFieldDefinitionJson,
} from "@src/common/crud/entity_field_definition_loader.ts";
export type {
	IEntityInfo,
	IEntityFieldInfo,
	IEntityAction,
	IEntityStorageInfo,
} from "@src/common/crud/entity_interfaces.ts";