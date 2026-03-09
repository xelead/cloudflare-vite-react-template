import { getEnvString, getWorkerEnv } from "@src/api/fw/config/env_helpers.ts";
import { ApiRes, type IApiResult } from "@src/interfaces/route_types.ts";

type PublicEnvKey = `NEXT_PUBLIC_${string}`;
type UiConfig = Record<string, string>;

function is_public_env_key(key: string): key is PublicEnvKey {
	return key.startsWith("NEXT_PUBLIC_");
}

export default async function publicconfigGet(): Promise<IApiResult<UiConfig>> {
	const ui_config: UiConfig = {};
	const worker_env = getWorkerEnv();
	const public_keys = Object.keys(worker_env).filter(is_public_env_key);

	const entries = await Promise.all(
		public_keys.map(async (key) => [key, await getEnvString(key)] as const),
	);

	for (const [key, value] of entries) {
		ui_config[key] = value;
	}

	return ApiRes.ok(ui_config);
}
