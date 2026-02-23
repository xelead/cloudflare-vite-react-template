# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```
E:\github\xelead\cloudflare-vite-react-template/
├── src/                     # Source code
│   ├── react-app/           # React frontend application
│   │   ├── assets/          # Static assets (SVG logos)
│   │   ├── pages/           # Page components (routes)
│   │   ├── ssr/             # Server-side rendering utilities
│   │   ├── state/           # React Context state management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.css          # Component-specific styles
│   │   ├── App.tsx          # Root application component
│   │   ├── index.css        # Global styles
│   │   ├── main.tsx         # Client entry point
│   │   └── vite-env.d.ts    # Vite type declarations
│   └── worker/              # Cloudflare Worker backend
│       ├── data/            # Static JSON data files
│       └── index.ts         # Worker entry point (Hono app)
├── public/                  # Static public assets
│   └── vite.svg             # Vite logo
├── dist/                    # Build output (generated)
├── .planning/               # Planning documentation
│   └── codebase/            # Codebase analysis documents
├── .wrangler/               # Wrangler CLI state
├── .gitignore               # Git ignore rules
├── AGENTS.md                # Agent documentation
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry template (dev only)
├── package.json             # Dependencies and scripts
├── README.md                # Project documentation
├── tsconfig.json            # TypeScript root config
├── tsconfig.app.json        # React app TypeScript config
├── tsconfig.node.json       # Node tooling TypeScript config
├── tsconfig.worker.json     # Worker TypeScript config
├── vite.config.ts           # Vite build configuration
├── worker-configuration.d.ts # Generated Cloudflare types
└── wrangler.json            # Cloudflare Workers deployment config
```

## Directory Purposes

**src/react-app/:**
- Purpose: React frontend source code
- Contains: Components, pages, styles, state management, types
- Key files: `main.tsx`, `App.tsx`, `pages/*.tsx`

**src/react-app/pages/:**
- Purpose: Route-level page components
- Contains: `Home.tsx`, `Projects.tsx`
- Pattern: Each file = one route

**src/react-app/ssr/:**
- Purpose: Server-side rendering implementation
- Contains: `render.tsx` with Document component and render function
- Key files: `render.tsx`

**src/react-app/state/:**
- Purpose: React Context providers and hooks
- Contains: `projects-data.tsx`
- Pattern: One context per domain feature

**src/react-app/types/:**
- Purpose: Shared TypeScript interfaces
- Contains: `projects.ts`
- Pattern: Co-located types for domain models

**src/react-app/assets/:**
- Purpose: Static assets imported by components
- Contains: `react.svg`, `Cloudflare_Logo.svg`, `hono.svg`
- Pattern: Assets co-located with components that use them

**src/worker/:**
- Purpose: Cloudflare Worker backend
- Contains: Hono app, API routes, static data
- Key files: `index.ts`

**src/worker/data/:**
- Purpose: Static JSON data served by API
- Contains: `projects.json`
- Pattern: JSON files imported directly into worker

**public/:**
- Purpose: Static assets served at root path
- Contains: `vite.svg`
- Pattern: Files referenced directly in HTML or by URL

**dist/:**
- Purpose: Build output directory
- Generated: Yes (by Vite build)
- Committed: No (in .gitignore)

## Key File Locations

**Entry Points:**
- `src/worker/index.ts`: Cloudflare Worker entry point
- `src/react-app/main.tsx`: Client-side React entry point
- `index.html`: Vite dev server HTML template

**Configuration:**
- `vite.config.ts`: Vite build configuration
- `wrangler.json`: Cloudflare Workers deployment settings
- `tsconfig.json`: TypeScript project references
- `tsconfig.app.json`: React app TypeScript settings
- `tsconfig.worker.json`: Worker TypeScript settings
- `eslint.config.js`: Linting rules

**Core Logic:**
- `src/worker/index.ts`: API route definitions
- `src/react-app/App.tsx`: Root component with routing
- `src/react-app/ssr/render.tsx`: SSR rendering logic
- `src/react-app/state/projects-data.tsx`: Data context

**Testing:**
- Not configured (no test files present)

## Naming Conventions

**Files:**
- Components: PascalCase (`App.tsx`, `Home.tsx`, `Projects.tsx`)
- Utilities/Hooks: camelCase (`projects-data.tsx`)
- Styles: Same name as component (`App.css` matches `App.tsx`)
- Types: Lowercase descriptive (`projects.ts`)

**Directories:**
- Lowercase with hyphens (`react-app`, `projects-data`)
- Purpose-descriptive names (`pages`, `state`, `types`, `ssr`)

**Imports:**
- Absolute imports from `/src/*` supported
- Relative imports use `../` for parent directories
- CSS imports with `?raw` suffix for inline embedding

## Where to Add New Code

**New Page/Route:**
- Implementation: `src/react-app/pages/{PageName}.tsx`
- Add route in: `src/react-app/App.tsx` (Route component)
- If SSR needed: Add route handler in `src/worker/index.ts`

**New API Endpoint:**
- Implementation: Add route in `src/worker/index.ts`
- Pattern: `app.get("/api/endpoint", handler)`

**New Component:**
- Shared components: `src/react-app/components/{ComponentName}.tsx`
- Styles: Co-located CSS file or inline styles

**New Data Type:**
- Types: `src/react-app/types/{domain}.ts`
- Update: Related components and context providers

**New State Context:**
- Implementation: `src/react-app/state/{feature}-data.tsx`
- Pattern: Follow `ProjectsDataProvider` structure

**New Static Data:**
- Data files: `src/worker/data/{data}.json`
- Import in: `src/worker/index.ts`

**Utilities:**
- Shared helpers: `src/react-app/utils/` (create if needed)

## Special Directories

**dist/:**
- Purpose: Build artifacts
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Contents: Client bundle in `dist/client/`, Worker bundle in `dist/cloudflare_vite_react_template/`

**.wrangler/:**
- Purpose: Wrangler CLI state and local development data
- Generated: Yes
- Committed: No (in .gitignore)
- Contents: Deploy configs, cache, Durable Objects state

**.planning/codebase/:**
- Purpose: Architecture and planning documentation
- Generated: Yes (by mapping agents)
- Committed: Yes (should be committed)
- Contents: `ARCHITECTURE.md`, `STRUCTURE.md`, etc.

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-23*
