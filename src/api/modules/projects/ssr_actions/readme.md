# Projects SSR Action Handlers

The `src/api/modules/projects/ssr_actions` folder contains SSR handlers that
export route metadata (`route`) and a default Hono handler function.

These handlers are auto-discovered and registered by
`src/api/route_registry.ts`.
