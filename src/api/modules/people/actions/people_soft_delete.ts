import {
	create_soft_delete_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/people/people_en.ts";
import type { IPerson } from "@src/api/modules/people/people_types.ts";

export const route = define_route("delete", "/api/people/:id");
export default create_soft_delete_action<IPerson>(entity_info);