# UI Application Layer

The `src/ui` folder hosts the React application, including entry points, route
composition, pages, SSR rendering, and feature modules. It is structured so
feature behavior lives in modules while app-level wiring stays in top-level
files, making navigation, rendering, and state flow easier to reason about.

## Agent Instructions

Place new user-facing behavior in the appropriate feature module or page and
keep app shell files focused on composition. Follow existing routing and SSR
patterns, keep UI logic typed and predictable, and avoid introducing API
implementation logic directly into UI components.
