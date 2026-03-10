import {
	create_get_meta_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info, get_project_entity_meta } from "@src/api/modules/projects/project_en.ts";

export const route = define_route("get", "/api/projects/meta");
export default create_get_meta_action(entity_info, get_project_entity_meta);