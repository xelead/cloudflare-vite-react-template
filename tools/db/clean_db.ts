import fs from "node:fs";
import path from "node:path";
import { connectToCoreDb, disconnectCoreClient } from "../../src/api/db/coredb.ts";
import {apply_public_dns_servers} from "./db_utils";

function parseEnvContent(content: string): Record<string, string> {
	const result: Record<string, string> = {};
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq_index = trimmed.indexOf("=");
		if (eq_index <= 0) continue;

		const key = trimmed.slice(0, eq_index).trim();
		let value = trimmed.slice(eq_index + 1).trim();
		if (
			(value.startsWith("\"") && value.endsWith("\"")) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (!process.env[key] || process.env[key]?.trim() === "") {
			process.env[key] = value;
		}
	}

	return result;
}

function loadNodeEnvFiles() {
	const env_files = [".dev.vars", ".env"];
	for (const env_file of env_files) {
		const full_path = path.resolve(process.cwd(), env_file);
		if (!fs.existsSync(full_path)) continue;
		parseEnvContent(fs.readFileSync(full_path, "utf-8"));
	}
}

async function cleanCoreDb() {
	loadNodeEnvFiles();
	await apply_public_dns_servers();
	console.log("Deleting all collections from core DB.");
	const dbSession = await connectToCoreDb();
	const db = dbSession.db;

	try {
		const collections = await db.collections();
		console.log(`There are ${collections.length} collections in the database to delete.`);

		for (let i = 0; i < collections.length; i++) {
			const collection = collections[i];
			if (!collection) continue;
			console.log(`Deleting collection ${collection.collectionName}`);
			await collection.drop();
		}
	} finally {
		await disconnectCoreClient(dbSession);
	}
}

cleanCoreDb()
	.then(() => {
		console.log("Clean database done.");
		process.exit(0);
	})
	.catch((e) => {
		console.log("Clean database error.");
		console.error(e);
		process.exit(1);
	});
