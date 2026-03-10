# Projects API Module

Provides project CRUD endpoints with unified `IApiResult` responses through
`safeApi`.

- `GET /api/projects`
- `GET /api/projects/meta` (dynamic entity + field metadata)
- `GET /api/projects/trashbin` (soft-deleted projects only)
- `GET /api/projects/:project_id`
- `POST /api/projects`
- `PATCH /api/projects/:project_id`
- `DELETE /api/projects/:project_id` (soft delete)

SSR routes for project pages are defined in `ssr_actions/` and auto-registered
by `src/api/route_registry.ts`.

Project field definitions are declared in `project_fields.json` and materialized
in `project_en.ts`.
