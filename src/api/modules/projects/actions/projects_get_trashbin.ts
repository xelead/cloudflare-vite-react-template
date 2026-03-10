import {
	create_get_trashbin_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/projects/project_en.ts";
import type { IProject } from "@src/api/modules/projects/project_types.ts";

export const route = define_route("get", "/api/projects/trashbin");
export default create_get_trashbin_action<IProject>(entity_info);