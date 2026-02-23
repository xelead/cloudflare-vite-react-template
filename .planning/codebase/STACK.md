# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5.8.3 - All source code (`.ts`, `.tsx` files)
- JavaScript (ES2020/ESNext) - Runtime target

**Secondary:**
- JSON - Configuration and data files (`/src/worker/data/projects.json`)
- CSS - Styling (`/src/react-app/App.css`, `/src/react-app/index.css`)
- HTML - Entry point (`/index.html`)

## Runtime

**Environment:**
- Cloudflare Workers (workerd runtime)
- Node.js compatibility mode enabled (`nodejs_compat` flag)
- Compatibility date: 2025-10-08

**Package Manager:**
- npm (via package-lock.json present)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.1 - UI library
- React DOM 19.2.1 - DOM rendering
- React Router DOM 6.28.0 - Client-side routing
- Hono 4.11.1 - Web framework for Worker API routes

**Build/Dev:**
- Vite ^6.0.0 - Build tool and dev server
- @cloudflare/vite-plugin 1.15.3 - Cloudflare Workers integration for Vite
- @vitejs/plugin-react 5.1.1 - React plugin for Vite

**Testing:**
- Not detected - No test framework configured

## Key Dependencies

**Critical:**
- `react` 19.2.1 - Core React library
- `react-dom` 19.2.1 - React DOM rendering (client and server)
- `react-router-dom` 6.28.0 - Routing for React applications
- `hono` 4.11.1 - Ultralight web framework for API routes

**Infrastructure:**
- `wrangler` 4.56.0 - Cloudflare Workers CLI and deployment tool
- `@cloudflare/vite-plugin` 1.15.3 - Vite integration for Cloudflare Workers

**Development:**
- `typescript` 5.8.3 - TypeScript compiler
- `typescript-eslint` 8.48.0 - ESLint plugin for TypeScript
- `@types/react` 19.2.7 - React type definitions
- `@types/react-dom` 19.2.3 - ReactDOM type definitions
- `@types/node` 24.10.1 - Node.js type definitions

**Linting:**
- `eslint` 9.39.2 - Linting tool
- `@eslint/js` 9.39.1 - ESLint JavaScript plugin
- `eslint-plugin-react-hooks` 7.0.1 - React Hooks linting rules
- `eslint-plugin-react-refresh` 0.4.24 - React Refresh linting rules
- `globals` 16.5.0 - Global variable definitions for ESLint

## Configuration

**TypeScript:**
- Root config: `/tsconfig.json` - Project references
- App config: `/tsconfig.app.json` - React application (ES2020, DOM libs, React JSX)
- Node config: `/tsconfig.node.json` - Node tooling (ES2022, ES2023 libs)
- Worker config: `/tsconfig.worker.json` - Worker code (extends node config, adds `vite/client` types)

**Build:**
- Vite config: `/vite.config.ts` - Vite + React + Cloudflare plugin setup
- Wrangler config: `/wrangler.json` - Cloudflare Workers deployment config
  - Entry: `./src/worker/index.ts`
  - Assets: `./dist/client`
  - Observability enabled
  - Source maps uploaded

**Linting:**
- ESLint config: `/eslint.config.js` - TypeScript + React Hooks + React Refresh rules

**Environment:**
- No `.env` files detected
- Environment configured via Wrangler (`wrangler.json`)
- Type definitions auto-generated: `/worker-configuration.d.ts`

## Platform Requirements

**Development:**
- Node.js with npm
- Commands:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build
  - `npm run lint` - Run ESLint
  - `npm run check` - Type check + build + dry-run deploy

**Production:**
- Cloudflare Workers platform
- Deploy command: `npm run deploy` (uses Wrangler)
- Monitor command: `npx wrangler tail`

**Browser Support:**
- Modern browsers (ES2020+)
- Uses Vite's default browserlist

---

*Stack analysis: 2026-02-23*
