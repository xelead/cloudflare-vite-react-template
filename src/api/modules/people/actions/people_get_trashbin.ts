import {
	create_get_trashbin_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info } from "@src/api/modules/people/people_en.ts";
import type { IPerson } from "@src/api/modules/people/people_types.ts";

export const route = define_route("get", "/api/people/trashbin");
export default create_get_trashbin_action<IPerson>(entity_info);