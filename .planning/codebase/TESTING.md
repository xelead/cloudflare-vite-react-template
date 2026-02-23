# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Runner:** Not configured
- No test runner installed (no Jest, Vitest, or Playwright)
- No test scripts in `package.json`

**Assertion Library:** Not configured

**Run Commands:**
```bash
# No test commands available
npm run lint      # Run ESLint only
npm run build     # TypeScript check + Vite build
npm run check     # Full type check + build + dry-run deploy
```

## Test File Organization

**Location:** Not applicable - no tests exist

**Naming:** Not applicable

**Structure:** Not applicable

## Current Testing Status

**Test Coverage:** 0%
- No unit tests
- No integration tests
- No E2E tests

**Project Files:**
- `src/react-app/App.tsx` - No tests
- `src/react-app/pages/Home.tsx` - No tests
- `src/react-app/pages/Projects.tsx` - No tests
- `src/react-app/state/projects-data.tsx` - No tests
- `src/react-app/ssr/render.tsx` - No tests
- `src/worker/index.ts` - No tests

## Recommended Testing Strategy

**Unit Tests (Vitest recommended):**
```typescript
// Example pattern for testing React components
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
```

**Integration Tests:**
```typescript
// Example for testing data fetching
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

describe('useProjectsData', () => {
  it('fetches projects from API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: [] }),
      })
    );
    // Test implementation
  });
});
```

**Worker Tests:**
```typescript
// Example for testing Hono routes
import { describe, it, expect } from 'vitest';
import app from './index';

describe('Worker API', () => {
  it('returns Cloudflare name on /api/', async () => {
    const res = await app.request('/api/');
    expect(await res.json()).toEqual({ name: 'Cloudflare' });
  });
});
```

## Mocking Recommendations

**Framework:** Vitest provides built-in mocking

**What to Mock:**
- `fetch` API calls in components
- `window.__INITIAL_DATA__` for SSR tests
- `Env` bindings in worker tests
- Static JSON imports

**What NOT to Mock:**
- React hooks (test actual behavior)
- Component props (pass real data)

## Testing Setup Requirements

**Dependencies to Add:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

**Test Script:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Coverage

**Requirements:** None enforced

**Current Status:** Not configured

**Recommended Target:** 80% for critical paths

## Test Types Priority

**Unit Tests:**
- `src/react-app/state/projects-data.tsx` - Context behavior
- `src/react-app/types/projects.ts` - Type guards if added

**Integration Tests:**
- `src/worker/index.ts` - API routes
- `src/react-app/pages/Projects.tsx` - Data fetching

**E2E Tests:**
- Not recommended until testing infrastructure in place
- Consider Playwright for critical user flows

## Special Considerations

**SSR Testing:**
- Requires mocking `renderToString` from `react-dom/server`
- Mock `StaticRouter` for route testing
- Handle CSS imports (`?raw` query)

**Worker Testing:**
- Use `hono/testing` utilities if available
- Mock Cloudflare Workers environment
- Test `Env` bindings

**React 19 Considerations:**
- Use `@testing-library/react` version compatible with React 19
- `createRoot` and `hydrateRoot` may need special handling

---

*Testing analysis: 2026-02-23*
