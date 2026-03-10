import { define_ssr_route } from "@src/api/fw/ssr/entity_ssr_route_factory.ts";
import { people_ssr_handlers } from "@src/api/modules/people/ssr_actions/people_ssr_handlers.ts";

export const route = define_ssr_route("/people/:person_id/edit");

export default people_ssr_handlers.edit;
