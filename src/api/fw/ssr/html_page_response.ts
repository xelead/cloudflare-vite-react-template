import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { render } from "@src/ui/ssr/render.tsx";
import type { AppInitialData } from "@src/ui/types/app_initial_data.ts";
import { resolve_client_asset_urls } from "@src/api/fw/ssr/client_asset_urls.ts";

const empty_initial_data: AppInitialData = {
	projects: [],
	people: [],
};

export function is_html_document_request(c: IAppContext): boolean {
	if (c.req.method !== "GET") return false;

	const sec_fetch_dest = c.req.header("sec-fetch-dest")?.toLowerCase() ?? "";
	if (sec_fetch_dest === "document") return true;

	const accept = c.req.header("accept")?.toLowerCase() ?? "";
	return accept.includes("text/html") || accept.includes("application/xhtml+xml");
}

export async function render_html_page(
	c: IAppContext,
	path: string,
	status: 200 | 404 | 500 = 200,
): Promise<Response> {
	const client_assets = await resolve_client_asset_urls(c);
	const { html } = render(path, empty_initial_data, client_assets);
	return c.html(html, status);
}
