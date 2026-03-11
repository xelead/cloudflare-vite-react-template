import type { Db } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import MongoDbRepo from "../../src/api/fw/db/mongo_repo.ts";
import {connectToCoreDb, disconnectCoreClient} from "../../src/api/db/coredb.ts";

let did_load_env = false;

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
		result[key] = value;
	}

	return result;
}

function loadNodeEnvFilesOnce() {
	if (did_load_env) return;
	did_load_env = true;

	const process_env = process.env;
	const env_files = [".dev.vars", ".env"];

	for (const env_file of env_files) {
		const full_path = path.resolve(process.cwd(), env_file);
		if (!fs.existsSync(full_path)) continue;
		const parsed = parseEnvContent(fs.readFileSync(full_path, "utf-8"));
		for (const [key, value] of Object.entries(parsed)) {
			if (!process_env[key] || process_env[key]?.trim() === "") {
				process_env[key] = value;
			}
		}
	}
}

/**
 * Checks that there is not duplicated (.id) fields in the list
 * And each row has an id
 * @param rows
 * @param collectionName - collection name
 */
function validateIds(collectionName: string, rows: any[]) {
	const ids: string[] = [];
	for (let i = 0; i < rows.length; i += 1) {
		const row = rows[i];
		if (!row) continue;
		if (!row.id) throw new Error(`No id defined for row with this data ${JSON.stringify(row)}`);

		if (ids.includes(String(rows[i].id))) throw new Error(`${collectionName} has duplicated id: ${row.id}`);

		ids.push(rows[i].id);
	}
}

/**
 * Saves the rows in the database
 * @param db
 * @param rows
 * @param collectionName
 */
async function populateDb(db: Db, rows: any[], collectionName: string) {
	const repo = new MongoDbRepo(db, collectionName);
	const promises: Promise<unknown>[] = [];

	for (let i = 0; i < rows.length; i += 1) {
		const row = rows[i];
		if (!row) continue;
		promises.push(repo.upsert(row));
	}

	await Promise.all(promises);
}

async function populateCoreDb(rows: any[], collectionName: string) {
	loadNodeEnvFilesOnce();
	console.log(`Populating ${collectionName}`);
	validateIds(collectionName, rows);
	const dbSession = await connectToCoreDb();
	await populateDb(dbSession.db, rows, collectionName);
	await disconnectCoreClient(dbSession);
	console.log(
		`Populated ${collectionName} with ${rows.length} rows`,
	);
}

export { populateCoreDb };
