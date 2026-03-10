/**
 * People Request Parser
 *
 * This module re-exports the generic entity parser bound to the people entity.
 * All parsing logic is driven by the entity metadata in people_en.ts
 */
import { create_entity_parser, type ParseResult } from "@src/common/crud/entity_request_parser.ts";
import { entity_info } from "@src/api/modules/people/people_en.ts";

// Create a parser instance bound to the people entity
const people_parser = create_entity_parser(entity_info);

/**
 * Parses and validates a create payload for a person
 */
export const parse_people_create_payload = people_parser.parseCreate;

/**
 * Parses and validates a patch payload for a person
 */
export const parse_people_patch_payload = people_parser.parsePatch;

/**
 * Gets the editable fields for the people entity
 */
export const get_people_editable_fields = people_parser.getEditableFields;

/**
 * Gets the required fields for the people entity
 */
export const get_people_required_fields = people_parser.getRequiredFields;

// Re-export the ParseResult type for convenience
export type { ParseResult };