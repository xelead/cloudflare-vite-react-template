import type { Db } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { connectToCoreDb, disconnectCoreClient } from "../../src/api/db/coredb.ts";
import DateTimeUtils from "../../src/common/utils/date_time_utils.ts";

type SeedModule = {
	default?: { up?: (db: Db) => Promise<void> | void };
	up?: (db: Db) => Promise<void> | void;
};

function loadNodeEnvFiles() {
	const env_files = [".dev.vars", ".env"];
	for (const env_file of env_files) {
		const full_path = path.resolve(process.cwd(), env_file);
		if (!fs.existsSync(full_path)) continue;

		const lines = fs.readFileSync(full_path, "utf-8").split(/\r?\n/);
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
	}
}

async function getSeedFileNames(): Promise<string[]> {
	const seed_files_path = path.resolve(process.cwd(), "test_data", "seeds");
	if (!fs.existsSync(seed_files_path)) return [];

	const entries = await fs.promises.readdir(seed_files_path, { withFileTypes: true });
	const file_paths = entries
		.filter((entry) => entry.isFile())
		.map((entry) => path.join(seed_files_path, entry.name))
		.filter((file_path) => file_path.endsWith(".ts") || file_path.endsWith(".js"));

	return file_paths.sort((a, b) => a.localeCompare(b));
}

async function loadAndRunSeedFile(db: Db, filePath: string) {
	console.log(`Running seed: ${filePath}`);
	const module_url = pathToFileURL(filePath).toString();
	const seed_module = (await import(module_url)) as SeedModule;

	const up =
		typeof seed_module.default?.up === "function"
			? seed_module.default.up
			: typeof seed_module.up === "function"
				? seed_module.up
				: null;

	if (!up) {
		throw new Error(`Seed file does not export an 'up' function: ${filePath}`);
	}

	await up(db);
}

async function populate_all_seed_data() {
	loadNodeEnvFiles();
	const file_names = await getSeedFileNames();
	if (file_names.length <= 0) throw new Error("No seed file found.");

	const dbClient = await connectToCoreDb()
	const db: Db = dbClient.db
	const started_at = DateTimeUtils.getCurrentDateTimeUtc();
	let is_successful = false;

	try {
		for (let i = 0; i < file_names.length; i++) {
			const file_path = file_names[i];
			if (!file_path) continue;
			await loadAndRunSeedFile(db, file_path);
		}
		is_successful = true;
	} finally {
		console.log("Seeds completed", {
			isSuccessful: is_successful,
			startedAt: started_at,
			endedAt: DateTimeUtils.getCurrentDateTimeUtc(),
		});
		await disconnectCoreClient(dbClient);
	}
}

populate_all_seed_data()
	.then(() => {
		console.log("Seed data population completed.");
		process.exit(0);
	})
	.catch((e) => {
		console.log("Seed data population failed.");
		console.error(e);
		process.exit(1);
	});
