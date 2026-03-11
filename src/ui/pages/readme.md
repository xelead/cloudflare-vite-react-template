# UI Route Pages

The `src/ui/pages` folder contains route-level page components that represent
top-level navigation targets. These files should stay focused on composing
module components and page-specific layout decisions.

## Agent Instructions

Keep page components thin and delegate business behavior to module components or
hooks. Follow the existing routing pattern in the UI app, keep data flow
explicit, and avoid duplicating module logic directly inside page files.

Error pages are also located here (`not_found.tsx` and `server_error.tsx`) so
the application can render app-layout HTML for HTTP `404` and `500` routes.
