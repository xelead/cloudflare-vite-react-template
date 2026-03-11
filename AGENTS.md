# Repository Guidelines

## Build, Test, and Development Commands

- `npm install`: Install dependencies.
- `npm run dev`: Start Vite dev server (http://localhost:5173).
- `npm run build`: Type-check and build client/SSR bundles.
- Build output uses deterministic client asset names (`/assets/index.js`) configured in `vite.config.ts` for SSR compatibility.
- `npm run preview`: Build and serve the production bundle locally.
- `npm run deploy`: Deploy to Cloudflare Workers via Wrangler.
- `npm run check`: Type-check, build, and run a deploy dry-run.
- `npm run lint`: Lint TS/TSX with ESLint.
- `npm run format`: Format repository files using Prettier.
- `npm run cf-typegen`: Generate Cloudflare Workers types.

## Coding Style & Naming Conventions

- TypeScript + React with ES modules.
- Indentation uses tabs (see `src/ui/main.tsx`).
- Use double quotes and semicolons to match existing files.
- Filenames: `kebab-case` for folders, `PascalCase` for components (e.g., `ProjectsPage.tsx`).
- Prefer colocating page components under `src/ui/pages/`.
- Reuse SSR route factories under `src/api/fw/ssr/` for module SSR pages to avoid duplicated handlers.
- Shared UI entity data providers/hooks live in `src/ui/common/entities_data.tsx` (avoid per-module duplicates).

## Testing Guidelines

- No test framework is configured yet. If you add tests, document the framework and add scripts to `package.json`.
- Suggested naming: `*.test.ts` / `*.test.tsx` near the code under test.

## Commit & Pull Request Guidelines

- Commit history favors short, imperative summaries (e.g., "fix build issues"). Keep messages concise and specific.
- PRs should include a clear description of changes and rationale.
- Link issues or tickets when applicable.
- Include screenshots for UI changes (desktop + mobile if relevant).
- Call out config or API changes (e.g., `wrangler.json`, SSR behavior).

## Security & Configuration Tips

- Avoid committing secrets; use Wrangler/Cloudflare bindings for environment values.
- Validate API-side inputs in `src/api/index.ts` for any new API routes.

## Agent-Specific Instructions

If you update this repository structure or tooling, also update this `AGENTS.md` to keep guidance accurate.
Always do git pull to ensure latest code from remote before executing
only Use new files for new features
Add new folders for new modules
Follow the code architectural style
Break the code into smaller functions whenever possible
Add short description in Readme files in related folders for new features
Use packages instead of implementing everything in the code base
Follow security best practices
commit all changes at the end of the work
Use snake case for file and folder names
