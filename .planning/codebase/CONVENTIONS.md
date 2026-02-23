# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- Components: PascalCase (`App.tsx`, `Home.tsx`, `Projects.tsx`)
- Utilities/Hooks: camelCase (`projects-data.tsx`, `render.tsx`)
- Types: camelCase with `.ts` extension (`projects.ts`)
- Styles: Co-located CSS files (`App.css`, `index.css`)
- Data files: camelCase JSON (`projects.json`)

**Functions:**
- React components: PascalCase (`function App()`, `function Home()`)
- Hooks: camelCase prefixed with `use` (`useProjectsData()`)
- Utilities: camelCase (`render()`)
- Event handlers: camelCase with verb prefix (`setCount`, `setName`)

**Variables:**
- State variables: Descriptive nouns (`count`, `name`, `projects`, `data`)
- Boolean flags: Prefixed with verb (`hasFetched`)
- Props destructuring: Direct parameter destructuring in function signature

**Types:**
- Interfaces/Types: PascalCase descriptive names (`Project`, `ProjectsResponse`, `RenderResult`)
- Type files: Co-located in `types/` directory
- Context value types: Suffix with `ContextValue` (`ProjectsDataContextValue`)

## Code Style

**Formatting:**
- Indentation: Tabs (visible in source files)
- Line endings: LF (Unix-style)
- Quote style: Double quotes for strings, single quotes for JSX attributes when needed
- Trailing commas: Not consistently used
- Semicolons: Optional (not present in source)

**Linting:**
- Tool: ESLint 9.x with flat config (`eslint.config.js`)
- TypeScript: `@typescript-eslint` plugin enabled
- React: `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` configured
- Key rules:
  - `react-refresh/only-export-components`: Warn with `allowConstantExport: true`
  - Extends recommended JS and TS configs

**Import Organization:**
- Order:
  1. External dependencies (React, Hono, etc.)
  2. Type imports (`import type { ... }`)
  3. Internal modules (relative paths)
  4. Asset imports (CSS, images)
- Path aliases: Not configured (uses relative paths)

## Error Handling

**Patterns:**
- API errors: Checked via `res.ok` before processing (`Projects.tsx` lines 17-21)
- Error fallback: Silent catch with fallback state (empty catch block with comment)
- Type casting: Used for JSON responses (`res.json() as Promise<ProjectsResponse>`)
- Context defaults: Nullish coalescing for missing context (`useContext(...) ?? { ... }`)

## Logging

**Framework:** `console` (not used in current codebase)
- No logging utility abstraction detected
- No error tracking service configured

## Comments

**When to Comment:**
- Inline comments explain intent, not mechanics
- Prefer self-documenting code
- Example: `// Fall back to the existing empty state.`

**JSDoc/TSDoc:**
- Not used in current codebase
- Types are explicit via TypeScript

## Function Design

**Size:** Small to medium functions
- Components: Under 100 lines
- Utility functions: Single responsibility

**Parameters:**
- Destructuring in function signatures for props
- Optional parameters indicated by `?` in types
- Default values via React hooks (`useState(0)`)

**Return Values:**
- Explicit return types on public functions
- React components return JSX.Element implicitly

## Module Design

**Exports:**
- Named exports for utilities and hooks (`export function useProjectsData()`)
- Default exports for page components (`export default Home`)
- Type exports explicit (`export type { ... }`)

**Barrel Files:**
- Not used - direct imports preferred

## React Patterns

**Components:**
- Functional components only
- Hooks for state management (`useState`, `useEffect`, `useContext`)
- Context pattern for shared state (`ProjectsDataContext`)

**State Management:**
- Local state: `useState` for component-specific data
- Global state: React Context in `src/react-app/state/`
- SSR hydration: Window object injection (`window.__INITIAL_DATA__`)

**Side Effects:**
- Data fetching in `useEffect` with dependency arrays
- Cleanup not explicitly needed in current code
- Fetch with error boundaries via try/catch in promise chain

## TypeScript Patterns

**Configuration:**
- Strict mode enabled (`"strict": true`)
- Unused locals/parameters checked
- Isolated modules for faster builds
- No unchecked side effect imports

**Type Declaration:**
- Explicit return types on exported functions
- Type-only imports for type references
- Global augmentation for `Window` interface (SSR data)

## CSS Conventions

**Organization:**
- Co-located with components (`App.tsx` + `App.css`)
- Global styles in `index.css`
- CSS custom properties (variables) for theming

**Naming:**
- BEM-like classes: `.page`, `.hero`, `.card`, `.project-grid`
- Modifier classes: `.hero-slim`, `.logo.react`
- Semantic naming over utility classes

**Import Pattern:**
- Standard CSS imports for bundling: `import "./App.css"`
- Raw CSS imports for SSR: `import styles from "./App.css?raw"`

---

*Convention analysis: 2026-02-23*
