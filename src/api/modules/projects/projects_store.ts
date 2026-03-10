/**
 * Projects Store
 *
 * This module uses the generic entity store bound to the project entity.
 * All CRUD operations are now driven by the entity metadata in project_en.ts
 */
import type { Db } from "mongodb";
import { create_entity_store, type EntityListInput } from "@src/common/crud/entity_store.ts";
import { entity_info } from "@src/api/modules/projects/project_en.ts";
import type { IProject } from "@src/api/modules/projects/project_types.ts";

// Create a store instance bound to the project entity
const project_store = create_entity_store(entity_info);

/**
 * Gets all projects with optional filtering and pagination
 */
export async function getAllProjects(
	db: Db,
	input?: EntityListInput,
): Promise<{ list: IProject[]; total: number }> {
	const result = await project_store.get_all(db, input);
	return result as unknown as { list: IProject[]; total: number };
}

/**
 * Gets soft-deleted projects (trash bin)
 */
export async function getTrashBinProjects(
	db: Db,
	input?: { pageNumber?: number; pageSize?: number; search?: string; status?: string },
): Promise<{ list: IProject[]; total: number }> {
	const result = await project_store.get_trashbin(db, input);
	return result as unknown as { list: IProject[]; total: number };
}

/**
 * Gets a single project by ID
 */
export async function getProjectById(db: Db, project_id: string): Promise<IProject | null> {
	return (await project_store.get_by_id(db, project_id)) as unknown as IProject | null;
}

/**
 * Creates a new project
 */
export async function createProject(
	db: Db,
	input: Record<string, unknown>,
): Promise<IProject> {
	return (await project_store.create(db, input)) as unknown as IProject;
}

/**
 * Updates a project
 */
export async function updateProject(
	db: Db,
	project_id: string,
	patch: Partial<IProject>,
): Promise<IProject | null> {
	return (await project_store.update(db, project_id, patch as Record<string, unknown>)) as unknown as IProject | null;
}

/**
 * Soft deletes a project
 */
export async function softDeleteProject(db: Db, project_id: string): Promise<IProject | null> {
	return (await project_store.soft_delete(db, project_id)) as unknown as IProject | null;
}