# Projects React Module

Contains the `Projects` list page, dynamic project details page
(`/projects/:project_id`), and project edit page (`/projects/:project_id/edit`)
used with API-provided data. The list
page also supports delete confirmation via dialog.

Field rendering is metadata-driven via `GET /api/projects/meta`, so form/list
UI reads from server-defined `entityInfo.fields` instead of hardcoded field
definitions.

Projects data context is shared from `src/ui/common/entities_data.tsx`.
