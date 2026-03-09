import type { EnvKey } from "@src/api/config/config_types.ts";

type EnvValue = string | { get?: () => Promise<string> | string } | undefined;
type EnvSource = Record<string, EnvValue>;
let worker_env_cache: EnvSource = {};

export const setWorkerEnv = (env: EnvSource) => {
	worker_env_cache = env;
};

export const getWorkerEnv = (): EnvSource => worker_env_cache;

const toEnvString = async (value: EnvValue): Promise<string> => {
	if (typeof value === "string") return value.trim();
	if (!value || typeof value !== "object") return "";

	if ("get" in value && typeof value.get === "function") {
		const resolved = await value.get();
		return typeof resolved === "string" ? resolved.trim() : "";
	}

	return "";
};

export const getEnvString = async (key: EnvKey | string): Promise<string> => {
	const process_env = (globalThis as { process?: { env?: EnvSource } }).process?.env ?? {};
	const process_value = await toEnvString(process_env[key]);
	if (process_value) return process_value;

	const worker_env = getWorkerEnv();
	return toEnvString(worker_env[key]);
};

export const getEnvNumber = async (key: EnvKey | string): Promise<number | undefined> => {
	const raw = await getEnvString(key);
	if (!raw) return undefined;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
};

export const getEnvBoolean = async (key: EnvKey | string): Promise<boolean | undefined> => {
	const raw = (await getEnvString(key)).toLowerCase();
	if (!raw) return undefined;
	if (["true", "1", "yes", "on"].includes(raw)) return true;
	if (["false", "0", "no", "off"].includes(raw)) return false;
	return undefined;
};

