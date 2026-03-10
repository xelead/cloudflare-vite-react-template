/**
 * Project Request Parser
 *
 * This module re-exports the generic entity parser bound to the project entity.
 * All parsing logic is now driven by the entity metadata in project_en.ts
 */
import { create_entity_parser, type ParseResult } from "@src/common/crud/entity_request_parser.ts";
import { entity_info } from "@src/api/modules/projects/project_en.ts";

// Create a parser instance bound to the project entity
const project_parser = create_entity_parser(entity_info);

/**
 * Parses and validates a create payload for a project
 * Works entirely from entity field metadata
 */
export const parse_project_create_payload = project_parser.parseCreate;

/**
 * Parses and validates a patch payload for a project
 * Works entirely from entity field metadata
 */
export const parse_project_patch_payload = project_parser.parsePatch;

/**
 * Gets the editable fields for the project entity
 */
export const get_project_editable_fields = project_parser.getEditableFields;

/**
 * Gets the required fields for the project entity
 */
export const get_project_required_fields = project_parser.getRequiredFields;

// Re-export the ParseResult type for convenience
export type { ParseResult };