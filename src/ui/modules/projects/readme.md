# Projects React Module

Contains the `Projects` list page, dynamic project details page
(`/projects/:project_id`), project edit page (`/projects/:project_id/edit`),
local data context, and response types used with API-provided data. The list
page also supports delete confirmation via dialog.

Field rendering is metadata-driven via `GET /api/projects/meta`, so form/list
UI reads from server-defined `entityInfo.fields` instead of hardcoded field
definitions.
