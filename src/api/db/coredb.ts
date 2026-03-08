import type { Db, MongoClient } from "mongodb";
import { getEnvString } from "../fw/config/env_helpers.ts";

declare global {
	var dbCoreCachedClient: MongoClient | undefined;
	var dbCoreCachedDb: Db | undefined;
}

function getDbNameFromUrl(url: string): string {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error("Invalid XE_CORE_DB_URL.");
	}

	const pathname = parsed.pathname.replace(/^\/+/, "").trim();
	if (!pathname) {
		throw new Error("XE_CORE_DB_URL must include a database name in its path.");
	}

	return pathname.split("/")[0] || "";
}

const connectToDatabase = async (url: string): Promise<Db> => {
	if (!url) throw new Error("Missing XE_CORE_DB_URL.");
	const dbName = getDbNameFromUrl(url);

	if (globalThis.dbCoreCachedDb) {
		return globalThis.dbCoreCachedDb;
	}

	if (!globalThis.dbCoreCachedClient) {
		const { MongoClient } = await import("mongodb");
		globalThis.dbCoreCachedClient = new MongoClient(url);
		await globalThis.dbCoreCachedClient.connect();
	}

	globalThis.dbCoreCachedDb = globalThis.dbCoreCachedClient.db(dbName);
	return globalThis.dbCoreCachedDb;
};

export async function disconnectCoreClient() {
	if (!globalThis.dbCoreCachedClient) return;
	await globalThis.dbCoreCachedClient.close();
	globalThis.dbCoreCachedClient = undefined;
	globalThis.dbCoreCachedDb = undefined;
}

export const connectToCoreDb = async (): Promise<Db> => {
	const url = await getEnvString("XE_CORE_DB_URL");
	return connectToDatabase(url);
};
