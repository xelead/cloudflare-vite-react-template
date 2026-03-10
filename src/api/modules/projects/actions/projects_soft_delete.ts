import {
	create_soft_delete_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/projects/project_en.ts";
import type { IProject } from "@src/api/modules/projects/project_types.ts";

export const route = define_route("delete", "/api/projects/:id");
export default create_soft_delete_action<IProject>(entity_info);