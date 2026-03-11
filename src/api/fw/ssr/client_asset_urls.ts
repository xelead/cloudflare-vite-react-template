import type { IAppContext } from "@src/api/fw/api_app_types.ts";

export type ClientAssetUrls = {
	moduleScriptSrc: string | null;
	stylesheetHrefs: string[];
};

export async function resolve_client_asset_urls(
	_c: IAppContext,
): Promise<ClientAssetUrls> {
	if (import.meta.env.DEV) {
		return {
			moduleScriptSrc: "/src/ui/main.tsx",
			stylesheetHrefs: [],
		};
	}

	return {
		moduleScriptSrc: "/assets/index.js",
		stylesheetHrefs: [],
	};
}
