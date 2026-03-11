import type { Db, MongoClient } from "mongodb";
import { getEnvString } from "../fw/config/env_helpers.ts";

function get_db_name_from_url(url: string): string {
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

function normalize_mongo_url(url: string): string {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return url;
	}

	if (parsed.hostname === "localhost") {
		parsed.hostname = "127.0.0.1";
	}

	// set direct connection for localhost because it fails the dev server if we don't add
	if (
		parsed.hostname == "127.0.0.1" &&
		!parsed.searchParams.has("directConnection")
	) {
		parsed.searchParams.set("directConnection", "true");
	}

	return parsed.toString();
}

async function create_mongo_client(url: string): Promise<MongoClient> {
	const { MongoClient } = await import("mongodb");

	const client_options = {
		serverSelectionTimeoutMS: 10000,
		connectTimeoutMS: 10000,
		socketTimeoutMS: 15000,
		maxPoolSize: 5,
		minPoolSize: 0,
	};
	return new MongoClient(url, client_options as never);
}

export type CoreDbSession = {
	db: Db;
	close: () => Promise<void>;
};

const connect_to_database = async (url: string): Promise<CoreDbSession> => {
	if (!url) throw new Error("Missing XE_CORE_DB_URL.");
	const normalized_url = normalize_mongo_url(url);
	const db_name = get_db_name_from_url(normalized_url);
	const client = await create_mongo_client(normalized_url);
	try {
		await client.connect();
	} catch (error) {
		try {
			await client.close();
		} catch (close_error) {
			console.error("Failed to close Mongo client after connect error:", close_error);
		}
		throw error;
	}

	return {
		db: client.db(db_name),
		close: async () => {
			await client.close();
		},
	};
};

export const connectToCoreDbSession = async (): Promise<CoreDbSession> => {
	const url = await getEnvString("XE_CORE_DB_URL");
	return connect_to_database(url);
};

// Alias for backward compatibility
export const connectToCoreDb = connectToCoreDbSession;

export async function disconnectCoreClient(
	client: CoreDbSession,
): Promise<void> {
	if (!client) return Promise.resolve();
	if (!client.db) return Promise.resolve();
	try {
		await client.close();
	} catch (e) {
		console.error("Error disconnecting from core database:", e);
	}
}