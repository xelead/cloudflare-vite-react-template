import type { IProject } from "@src/api/modules/projects/project_types.ts";
import type { Db } from "mongodb";

const COLLECTION_NAME = "projects";

type ProjectQuery = {
	id?: string;
	status?: string;
	name?: string;
	deleted_at?: string | null;
};

type ProjectPatchInput = Partial<Omit<IProject, "id" | "created_at">>;

type ListProjectsInput = {
	pageNumber?: number;
	pageSize?: number;
	search?: string;
	status?: string;
};

const now = () => new Date().toISOString();

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function normalizeProjectCreateInput(input: {
	id?: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
}): IProject {
	const timestamp = now();
	const generated_id = slugify(input.id?.trim() || input.name);
	const project_id = generated_id.length > 0 ? generated_id : `project-${Date.now()}`;

	return {
		id: project_id,
		name: input.name.trim(),
		summary: input.summary.trim(),
		year: input.year,
		status: input.status.trim(),
		stack: input.stack.map((item) => item.trim()).filter(Boolean),
		link: input.link?.trim() || undefined,
		created_at: timestamp,
		updated_at: timestamp,
		deleted_at: null,
	};
}

async function getProjectsRepo(db: Db) {
	const { default: MongoDbRepo } = await import("@src/api/fw/db/mongo_repo.ts");
	return new MongoDbRepo<ProjectQuery, IProject, ProjectPatchInput, keyof IProject>(
		db,
		COLLECTION_NAME,
	);
}

export async function getAllProjects(
	db: Db,
	input?: ListProjectsInput,
): Promise<{ list: IProject[]; total: number }> {
	const page_number = Math.max(1, Number(input?.pageNumber) || 1);
	const page_size = Math.max(1, Number(input?.pageSize) || 10);
	const repo = await getProjectsRepo(db);

	let items = await repo.find({} as ProjectQuery);

	if (input?.search) {
		const search = input.search.trim().toLowerCase();
		items = items.filter(
			(item) =>
				item.name.toLowerCase().includes(search) || item.summary.toLowerCase().includes(search),
		);
	}

	if (input?.status) {
		items = items.filter((item) => item.status === input.status);
	}

	items = items.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
	const total = items.length;
	const start = (page_number - 1) * page_size;
	const end = start + page_size;
	return { list: items.slice(start, end), total };
}

export async function getTrashBinProjects(
	db: Db,
	input?: ListProjectsInput,
): Promise<{ list: IProject[]; total: number }> {
	const page_number = Math.max(1, Number(input?.pageNumber) || 1);
	const page_size = Math.max(1, Number(input?.pageSize) || 10);
	const collection = db.collection<IProject>(COLLECTION_NAME);
	const deleted_query = { deleted_at: { $ne: null } };
	let items = await collection.find(deleted_query).toArray();

	if (input?.search) {
		const search = input.search.trim().toLowerCase();
		items = items.filter(
			(item) =>
				item.name.toLowerCase().includes(search) || item.summary.toLowerCase().includes(search),
		);
	}

	if (input?.status) {
		items = items.filter((item) => item.status === input.status);
	}

	items = items.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
	const total = items.length;
	const start = (page_number - 1) * page_size;
	const end = start + page_size;
	return { list: items.slice(start, end), total };
}

export async function getProjectById(db: Db, project_id: string): Promise<IProject | null> {
	const repo = await getProjectsRepo(db);
	return repo.findOne({ id: project_id });
}

export async function createProject(
	db: Db,
	input: {
	id?: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
},
): Promise<IProject> {
	const project = normalizeProjectCreateInput(input);
	const repo = await getProjectsRepo(db);
	const duplicate = await repo.findOne({ id: project.id });
	if (duplicate) {
		throw { code: 409, errorType: "conflict", message: "Project id already exists." };
	}
	const result = await repo.create(project);
	if (!result.isSuccessful) {
		throw { code: 500, errorType: "db_error", message: "Failed to create project." };
	}
	return project;
}

export async function updateProject(
	db: Db,
	project_id: string,
	patch: ProjectPatchInput,
): Promise<IProject | null> {
	const repo = await getProjectsRepo(db);
	const update_data: ProjectPatchInput = { ...patch, updated_at: now() };

	if ("link" in patch && !patch.link) update_data.link = undefined;
	for (const key of Object.keys(update_data) as Array<keyof ProjectPatchInput>) {
		if (update_data[key] === undefined) delete update_data[key];
	}

	const current = await repo.findOne({ id: project_id });
	if (!current) return null;
	const update_result = await repo.updateOne({ id: project_id }, update_data);
	if (!update_result.isSuccessful) {
		throw { code: 500, errorType: "db_error", message: "Failed to update project." };
	}
	return repo.findOne({ id: project_id });
}

export async function softDeleteProject(db: Db, project_id: string): Promise<IProject | null> {
	const timestamp = now();
	const repo = await getProjectsRepo(db);
	const current = await repo.findOne({ id: project_id });
	if (!current) return null;
	const update_result = await repo.updateOne(
		{ id: project_id },
		{ deleted_at: timestamp, updated_at: timestamp },
	);
	if (!update_result.isSuccessful) {
		throw { code: 500, errorType: "db_error", message: "Failed to delete project." };
	}
	return { ...current, deleted_at: timestamp, updated_at: timestamp };
}
