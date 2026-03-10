import {
	create_list_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/people/people_en.ts";
import type { IPerson } from "@src/api/modules/people/people_types.ts";

export const route = define_route("get", "/api/people");
export default create_list_action<IPerson>(entity_info);