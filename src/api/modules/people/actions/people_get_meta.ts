import {
	create_get_meta_action,
	define_route,
} from "@src/api/fw/crud/index.ts";
import { entity_info, get_people_entity_meta } from "@src/api/modules/people/people_en.ts";

export const route = define_route("get", "/api/people/meta");
export default create_get_meta_action(entity_info, get_people_entity_meta);