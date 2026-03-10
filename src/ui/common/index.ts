// Entity utilities
export {
	render_field_value,
	to_input_value,
	parse_field_input,
	build_form_state,
	get_changed_patch_payload,
	type ClientEntityField,
	type ClientEntityMeta,
	type EntityMetaApiResponse,
} from "./entity_utils.ts";

// Hooks
export { use_entity_meta, create_use_entity_meta, type UseEntityMetaResult } from "./use_entity_meta.ts";

// Context
export {
	create_entity_data_context,
	create_entity_list_context,
	type EntityDataContextValue,
	type EntityListResponse,
	type EntityItemResponse,
} from "./entity_data_context.tsx";

// Components
export { DeleteConfirmDialog, useDeleteConfirmation } from "./DeleteConfirmDialog.tsx";
export { EntityListGrid, type EntityListGridProps, type ViewMode } from "./EntityListGrid.tsx";
export { EntityViewPage, create_entity_view_page } from "./EntityViewPage.tsx";
export { EntityEditPage, create_entity_edit_page } from "./EntityEditPage.tsx";
export { EntityListPage, create_entity_list_page } from "./EntityListPage.tsx";