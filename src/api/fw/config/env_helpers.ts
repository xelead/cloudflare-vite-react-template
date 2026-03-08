


const getWorkerEnv = (): NodeJS.ProcessEnv => {
	try {
		return getCloudflareContext().env as NodeJS.ProcessEnv;
	} catch {
		console.log("Worker environment not available, falling back to process.env");
		return process.env;
	}
};

const toEnvString = async (value: unknown): Promise<string> => {
	if (typeof value === "string") return value;
	if (value && typeof value === "object" && "get" in value) {
		const getter = (value as { get?: () => Promise<string> | string }).get;
		if (typeof getter === "function") {
			return await getter();
		}
	}
	return "";
};

export const getEnvString = async (key: EnvKey): Promise<string> => {
	const workerEnv = getWorkerEnv();
	return await toEnvString(workerEnv?.[key]);
};


export const getEnvNumber = async (key: Parameters<typeof getEnvString>[0]) => {
	const raw = await getEnvString(key);
	if (!raw) return undefined;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return undefined;
	return parsed;
};

export const getEnvBoolean = async (key: Parameters<typeof getEnvString>[0]) => {
	const raw = (await getEnvString(key)).trim();
	if (!raw) return undefined;
	const normalized = raw.toLowerCase();
	if (["true", "1", "yes", "on"].includes(normalized)) return true;
	if (["false", "0", "no", "off"].includes(normalized)) return false;
	return undefined;
};

