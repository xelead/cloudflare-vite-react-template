import { define_ssr_route } from "@src/api/fw/ssr/entity_ssr_route_factory.ts";
import { projects_ssr_handlers } from "@src/api/modules/projects/ssr_actions/projects_ssr_handlers.ts";

export const route = define_ssr_route("/projects");

export default projects_ssr_handlers.index;
