import { IApp } from "@src/api/fw/api_app_types.ts";
import { getEnvString, getWorkerEnv } from "@src/api/fw/config/env_helpers.ts";
import {EnvKey} from "@src/api/config/config_types.ts";

type UiConfig = Record<string, string>;

const NEXT_PUBLIC_PREFIX = "NEXT_PUBLIC_";

async function get_public_env_config(): Promise<UiConfig> {
	const ui_config: UiConfig = {};
	const worker_env = getWorkerEnv();
	const public_keys = Object.keys(worker_env).filter((key) =>
		key.startsWith(NEXT_PUBLIC_PREFIX),
	);

	const entries = await Promise.all(
		public_keys.map(async (key) => [key, await getEnvString(key as EnvKey)] as const),
	);

	for (const [key, value] of entries) {
		ui_config[key] = value;
	}

	return ui_config;
}

export class PublicConfigApiRoutes {
	private app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}

	register_routes() {
		this.app.get("/api/publicconfig", async (c) => {
			c.header("Cache-Control", "no-store, max-age=0");
			return c.json(await get_public_env_config());
		});
	}
}
