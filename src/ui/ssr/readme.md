# UI Server-Side Rendering

The `src/ui/ssr` folder contains server-side rendering entry logic for the React
application. This layer handles render orchestration and must stay aligned with
app routing and initial data contracts.

## Agent Instructions

Keep SSR code focused on render pipeline concerns and avoid embedding
feature-specific UI behavior here. Preserve deterministic rendering, align with
current app route definitions, and maintain compatibility with API-provided
initial data structures.
