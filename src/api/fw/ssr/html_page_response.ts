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
	try {
		const client_assets = await resolve_client_asset_urls(c);
		const { html } = render(path, empty_initial_data, client_assets);
		return c.html(html, status);
	} catch (error) {
		console.error("SSR HTML render failed:", {
			path,
			status,
			error,
		});

		const fallback_title = status === 500 ? "Internal Server Error" : "Not Found";
		const fallback_body = status === 500
			? "Something went wrong while rendering this page."
			: "The requested page could not be found.";
		const fallback_html =
			`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${fallback_title}</title></head><body><main><h1>${fallback_title}</h1><p>${fallback_body}</p></main></body></html>`;
		return c.html(fallback_html, status);
	}
}
