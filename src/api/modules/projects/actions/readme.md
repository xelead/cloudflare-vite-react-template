# Projects Action Handlers

The `src/api/modules/projects/actions` folder contains focused action functions
for project CRUD and soft-delete behavior. Each file encapsulates one backend
use case so route handlers can stay thin and primarily handle HTTP concerns.

Includes list handlers for both active projects (`projects_get.ts`) and
soft-deleted projects (`projects_get_trashbin.ts`).

## Agent Instructions

Continue using one-action-per-file naming and keep each action responsible for
validation, data access orchestration, and typed API result construction. Reuse
shared CRUD and route response utilities, avoid direct routing concerns in
action files, and keep project domain rules cohesive here.
