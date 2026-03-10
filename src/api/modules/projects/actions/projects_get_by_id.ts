import {
	create_get_by_id_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/projects/project_en.ts";
import type { IProject } from "@src/api/modules/projects/project_types.ts";

export const route = define_route("get", "/api/projects/:id");
export default create_get_by_id_action<IProject>(entity_info);