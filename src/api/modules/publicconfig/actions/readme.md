# Public Config Action Handlers

The `src/api/modules/publicconfig/actions` folder contains action logic that
serves publicly consumable configuration data. This action layer isolates
data-fetching and response construction from route registration.

## Agent Instructions

Keep actions in this folder minimal, deterministic, and explicitly typed, and
ensure returned data is safe for public exposure. Follow the existing safe API
response pattern and avoid mixing route wiring or unrelated feature logic into
these files.
