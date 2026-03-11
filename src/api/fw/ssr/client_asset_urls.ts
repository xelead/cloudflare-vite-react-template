import type { IAppContext } from "@src/api/fw/api_app_types.ts";

export type ClientAssetUrls = {
	moduleScriptSrc: string | null;
	stylesheetHrefs: string[];
};

type AssetFetcher = {
	fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

let cached_asset_urls: ClientAssetUrls | null = null;
let cached_asset_urls_promise: Promise<ClientAssetUrls> | null = null;

export async function resolve_client_asset_urls(
	c: IAppContext,
): Promise<ClientAssetUrls> {
	if (import.meta.env.DEV) {
		return {
			moduleScriptSrc: "/src/ui/main.tsx",
			stylesheetHrefs: [],
		};
	}

	if (cached_asset_urls) {
		return cached_asset_urls;
	}

	if (cached_asset_urls_promise) {
		return cached_asset_urls_promise;
	}

	cached_asset_urls_promise = load_client_asset_urls(c)
		.then((result) => {
			cached_asset_urls = result;
			return result;
		})
		.finally(() => {
			cached_asset_urls_promise = null;
		});

	return cached_asset_urls_promise;
}

async function load_client_asset_urls(c: IAppContext): Promise<ClientAssetUrls> {
	const assets = (c.env as { ASSETS?: AssetFetcher }).ASSETS;
	if (!assets) {
		throw new Error("Missing ASSETS binding. Cannot resolve client bundle assets.");
	}

	const index_url = new URL("/index.html", c.req.url).toString();
	const index_response = await assets.fetch(index_url);
	if (!index_response.ok) {
		throw new Error(
			`Failed to load index.html from assets binding (status ${index_response.status}).`,
		);
	}

	const index_html = await index_response.text();
	const module_script_src = get_module_script_src(index_html);
	if (!module_script_src) {
		throw new Error("Failed to find module script src in built index.html.");
	}

	return {
		moduleScriptSrc: module_script_src,
		stylesheetHrefs: get_stylesheet_hrefs(index_html),
	};
}

function get_module_script_src(index_html: string): string | null {
	const script_regex =
		/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi;
	let match: RegExpExecArray | null = null;
	let src: string | null = null;

	while (true) {
		match = script_regex.exec(index_html);
		if (!match) break;
		src = match[1] ?? null;
	}

	return src;
}

function get_stylesheet_hrefs(index_html: string): string[] {
	const hrefs: string[] = [];
	const link_regex =
		/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
	let match: RegExpExecArray | null = null;

	while (true) {
		match = link_regex.exec(index_html);
		if (!match) break;
		if (match[1]) hrefs.push(match[1]);
	}

	return hrefs;
}
