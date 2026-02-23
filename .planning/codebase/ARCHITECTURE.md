# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Full-stack React SSR with Edge Worker Backend

This is a Cloudflare Workers-based full-stack application using React 19 with Server-Side Rendering (SSR). The architecture combines a Hono backend API running on Cloudflare Workers with a Vite-powered React frontend that supports both client-side hydration and server-side rendering.

**Key Characteristics:**
- Edge-deployed backend (Cloudflare Workers)
- Isomorphic React with SSR and client-side hydration
- JSON import for static data (no database)
- React Router v6 for client-side navigation
- Vite with Cloudflare plugin for unified development

## Layers

**Worker Layer (Backend API):**
- Purpose: Serve API endpoints and handle SSR requests
- Location: `src/worker/`
- Contains: Hono app, route handlers, static JSON data
- Depends on: Hono framework, Cloudflare Workers runtime
- Used by: Client via HTTP requests, SSR renderer

**React Application Layer (Frontend):**
- Purpose: UI components, state management, routing
- Location: `src/react-app/`
- Contains: Pages, components, styles, context providers
- Depends on: React 19, React Router DOM, CSS modules
- Used by: SSR renderer, client entry point

**SSR Layer (Server-Side Rendering):**
- Purpose: Generate HTML on the server for initial page load
- Location: `src/react-app/ssr/`
- Contains: `render.tsx` with StaticRouter and Document component
- Depends on: React DOM server, React Router DOM server
- Used by: Worker layer for `/projects` route

**State Layer (Client-Side Data):**
- Purpose: Provide reactive data via React Context
- Location: `src/react-app/state/`
- Contains: `ProjectsDataProvider` and `useProjectsData` hook
- Depends on: React Context API
- Used by: Pages that need projects data

**Types Layer (Shared Types):**
- Purpose: TypeScript type definitions
- Location: `src/react-app/types/`
- Contains: `Project`, `ProjectsResponse` types
- Depends on: TypeScript
- Used by: All TypeScript modules

## Data Flow

**SSR Page Load (e.g., /projects):**

1. Request hits Cloudflare Worker (`src/worker/index.ts`)
2. Worker loads JSON data from `src/worker/data/projects.json`
3. Worker calls `render()` from `src/react-app/ssr/render.tsx`
4. SSR layer renders React tree with `StaticRouter` and `ProjectsDataProvider`
5. Full HTML document generated with embedded `window.__INITIAL_DATA__`
6. Client receives complete rendered page

**Client-Side Hydration:**

1. Browser parses HTML including `window.__INITIAL_DATA__`
2. `main.tsx` reads initial data from global window object
3. `hydrateRoot` hydrates the server-rendered markup
4. React takes over with `BrowserRouter` for SPA navigation
5. Future navigation uses client-side routing

**API Data Fetch (Client-Side):**

1. Component mounts and checks if data exists
2. If empty, fetches from `/api/projects`
3. Response updates `ProjectsDataContext`
4. UI re-renders with new data

**State Management:**
- React Context for global data (`ProjectsDataProvider`)
- `useState` for local component state
- Hydration-aware: SSR provides initial state, client can update

## Key Abstractions

**Hono App Instance:**
- Purpose: HTTP request routing and response handling
- Location: `src/worker/index.ts`
- Pattern: Functional route handlers with typed bindings
- Example: `app.get("/api/projects", (c) => c.json({ projects }))`

**Document Component:**
- Purpose: Generate complete HTML document structure for SSR
- Location: `src/react-app/ssr/render.tsx` lines 14-41
- Pattern: Renders HTML shell with embedded styles and initial data
- Usage: Wraps React app tree, injects `__INITIAL_DATA__`

**Render Function:**
- Purpose: Server-side React rendering entry point
- Location: `src/react-app/ssr/render.tsx` lines 43-60
- Pattern: Returns `{ html: string }` with full document
- Parameters: URL path, initial data payload

**ProjectsDataProvider:**
- Purpose: Context provider for projects data with SSR support
- Location: `src/react-app/state/projects-data.tsx`
- Pattern: React Context with initial data from props or window
- Usage: Wraps app to provide `useProjectsData` hook

## Entry Points

**Worker Entry Point:**
- Location: `src/worker/index.ts`
- Triggers: Cloudflare Workers runtime
- Responsibilities:
  - Define API routes (`/api/*`)
  - Define SSR routes (`/projects`)
  - Serve static assets
  - Export Hono app as default

**Client Entry Point:**
- Location: `src/react-app/main.tsx`
- Triggers: Browser script execution
- Responsibilities:
  - Detect hydration vs fresh render
  - Initialize `ProjectsDataProvider` with `window.__INITIAL_DATA__`
  - Mount React with `BrowserRouter`
  - Handle hydration for SSR pages

**Vite Dev Entry:**
- Location: `index.html`
- Triggers: Vite dev server
- Responsibilities: Load `main.tsx` in development

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**
- API fetch errors caught and silently ignored (falls back to empty state) - see `src/react-app/pages/Projects.tsx` lines 28-30
- Context provides default empty state if used outside provider
- TypeScript strict mode catches type errors at build time

**SSR Safety:**
- JSON data sanitized before embedding (`replace(/</g, "\\u003c")`)
- Prevents XSS from data injection

## Cross-Cutting Concerns

**Logging:** Not explicitly configured - relies on Cloudflare Workers native logging via `console`

**Validation:** No runtime validation - relies on TypeScript compile-time checking

**Authentication:** Not implemented - no auth layer present

**Styling:** CSS-in-JS via inline CSS imports (`?raw` imports in SSR)

---

*Architecture analysis: 2026-02-23*
