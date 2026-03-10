/**
 * People Store
 *
 * This module uses the generic entity store bound to the people entity.
 * All CRUD operations are driven by the entity metadata in people_en.ts
 */
import type { Db } from "mongodb";
import { create_entity_store, type EntityListInput } from "@src/common/crud/entity_store.ts";
import { entity_info } from "@src/api/modules/people/people_en.ts";
import type { IPerson } from "@src/api/modules/people/people_types.ts";

// Create a store instance bound to the people entity
const people_store = create_entity_store(entity_info);

/**
 * Gets all people with optional filtering and pagination
 */
export async function getAllPeople(
	db: Db,
	input?: EntityListInput,
): Promise<{ list: IPerson[]; total: number }> {
	const result = await people_store.get_all(db, input);
	return result as unknown as { list: IPerson[]; total: number };
}

/**
 * Gets soft-deleted people (trash bin)
 */
export async function getTrashBinPeople(
	db: Db,
	input?: { pageNumber?: number; pageSize?: number; search?: string; status?: string },
): Promise<{ list: IPerson[]; total: number }> {
	const result = await people_store.get_trashbin(db, input);
	return result as unknown as { list: IPerson[]; total: number };
}

/**
 * Gets a single person by ID
 */
export async function getPersonById(db: Db, person_id: string): Promise<IPerson | null> {
	return (await people_store.get_by_id(db, person_id)) as unknown as IPerson | null;
}

/**
 * Creates a new person
 */
export async function createPerson(db: Db, input: Record<string, unknown>): Promise<IPerson> {
	return (await people_store.create(db, input)) as unknown as IPerson;
}

/**
 * Updates a person
 */
export async function updatePerson(
	db: Db,
	person_id: string,
	patch: Partial<IPerson>,
): Promise<IPerson | null> {
	return (await people_store.update(db, person_id, patch as Record<string, unknown>)) as unknown as IPerson | null;
}

/**
 * Soft deletes a person
 */
export async function softDeletePerson(db: Db, person_id: string): Promise<IPerson | null> {
	return (await people_store.soft_delete(db, person_id)) as unknown as IPerson | null;
}