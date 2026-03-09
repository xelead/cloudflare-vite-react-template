# API Framework Core

The `src/api/fw` folder contains framework-level backend plumbing such as route
safety wrappers, CORS handling, environment helpers, repository primitives, and
common API app types. This is the foundational layer that standardizes how
modules register routes and return structured results.

## Agent Instructions

Treat this folder as shared backend infrastructure and keep it generic so all
API modules can consume it consistently. Prefer extending existing safe-route
and utility patterns instead of introducing one-off middleware behavior, and
ensure framework changes remain backward compatible for module routes.
