# Codebase Concerns

**Analysis Date:** 2026-02-23

## Test Coverage Gap

**Issue:** No test files exist for the application code.
- Files: `src/react-app/pages/Home.tsx`, `src/react-app/pages/Projects.tsx`, `src/react-app/state/projects-data.tsx`, `src/worker/index.ts`
- Impact: Changes to business logic, data fetching, or state management cannot be safely validated. Regressions may go unnoticed.
- Fix approach: Add test framework (Vitest or Jest) and write unit tests for state management, API handlers, and page components. Add integration tests for SSR rendering flow.

## SSR Hydration Mismatch Risk

**Issue:** Client-side hydration depends on `window.__INITIAL_DATA__` which may be undefined or malformed.
- Files: `src/react-app/main.tsx` (lines 15, 29-32)
- Impact: If server-rendered HTML and client-side React tree differ, React will perform a full re-render, negating SSR benefits and causing visible UI flicker.
- Fix approach: Add validation of `__INITIAL_DATA__` shape before hydration. Consider using a serialization library for type-safe data transfer.

## Silent Error Handling

**Issue:** API errors in Projects page are caught but silently ignored.
- Files: `src/react-app/pages/Projects.tsx` (lines 28-30)
- Impact: Users see empty state instead of error feedback when API fails. Harder to debug production issues.
- Fix approach: Set an error state and display user-friendly error message with retry option.

## XSS Risk in SSR

**Issue:** JSON data embedded in HTML uses manual string replacement for escaping.
- Files: `src/react-app/ssr/render.tsx` (line 44)
- Impact: While `replace(/</g, "\\u003c")` handles opening brackets, it may not cover all XSS vectors (e.g., `</script>` with different casing).
- Current mitigation: Basic HTML bracket escaping
- Recommendations: Use a robust serialization library like `serialize-javascript` or implement full HTML escaping for all special characters.

## No Input Validation

**Issue:** Projects JSON is imported and served without runtime validation.
- Files: `src/worker/data/projects.json`, `src/worker/index.ts` (line 2), `src/react-app/types/projects.ts`
- Impact: Malformed JSON or unexpected data shapes could cause runtime crashes. TypeScript types provide compile-time safety only.
- Fix approach: Add runtime validation using Zod or similar schema validation library before serving data.

## Missing Loading States

**Issue:** No visual feedback during data fetching.
- Files: `src/react-app/pages/Projects.tsx` (lines 10-31)
- Impact: Users may think the page is broken while waiting for API response, especially on slow networks.
- Fix approach: Add `isLoading` state and display skeleton or spinner component while fetching.

## No Request Cancellation

**Issue:** Fetch requests in useEffect are not cancellable.
- Files: `src/react-app/pages/Projects.tsx` (lines 16-30)
- Impact: If user navigates away while request is in flight, React may attempt state update on unmounted component (though React 19 may handle this better, it's still a race condition).
- Fix approach: Use AbortController to cancel fetch on component unmount or dependency change.

## Import Extension Inconsistency

**Issue:** Mix of `.ts` and `.tsx` extensions in import statements.
- Files: `src/react-app/state/projects-data.tsx` imports from `../types/projects.ts` (which doesn't have .tsx extension), but other files import with extensions
- Impact: Potential TypeScript resolution issues depending on moduleResolution setting. Inconsistent code style.
- Fix approach: Standardize on no extension or consistent extension usage per project conventions.

## CSS Injection via Template Literal

**Issue:** Styles are concatenated and injected as raw CSS.
- Files: `src/react-app/ssr/render.tsx` (lines 7-8, 45)
- Impact: If CSS files contain malformed content or malicious injection, it could break rendering. Also duplicates CSS handling logic.
- Fix approach: Consider using Vite's built-in CSS handling or a CSS-in-JS solution with proper sanitization.

## No Security Headers

**Issue:** No Content Security Policy or security headers configured.
- Files: `src/worker/index.ts`
- Impact: XSS attacks, clickjacking, and other injection attacks have fewer mitigations.
- Fix approach: Add security headers middleware (CSP, X-Frame-Options, etc.) to Hono responses.

## No Rate Limiting

**Issue:** API endpoints have no rate limiting protection.
- Files: `src/worker/index.ts` (lines 7-12)
- Impact: API could be abused or DOS'd with excessive requests.
- Fix approach: Implement rate limiting using Cloudflare's native rate limiting or add middleware-based rate limiting.

## Static JSON Data Source

**Issue:** Projects data is loaded from static JSON file.
- Files: `src/worker/data/projects.json`
- Impact: Data updates require code redeployment. No dynamic data source (database, KV, etc.).
- Fix approach: Consider moving data to Cloudflare KV, D1, or external CMS for dynamic updates without redeployment.

## Mixed Concern in Worker

**Issue:** Worker imports React app code for SSR rendering.
- Files: `src/worker/index.ts` (line 3)
- Impact: Blurs the boundary between API layer and presentation layer. Worker bundle includes React dependencies which increases size.
- Fix approach: Consider separating SSR into a dedicated entry point or using a more decoupled architecture.

## No Health Check Endpoint

**Issue:** No dedicated health check or status endpoint.
- Impact: Deployments and monitoring tools cannot verify service health.
- Fix approach: Add `/health` or `/api/health` endpoint returning 200 OK.

## Missing 404 Handling

**Issue:** No catch-all route for unmatched paths.
- Files: `src/worker/index.ts`
- Impact: Unmatched routes return default 404 which may not be styled or informative.
- Fix approach: Add `.notFound()` handler to Hono app or implement client-side 404 page with proper SSR support.

## No Accessibility Features

**Issue:** Links open in new tab without security or accessibility attributes.
- Files: `src/react-app/pages/Home.tsx` (lines 15-23)
- Impact: Security risk (tabnabbing) and missing screen reader context.
- Fix approach: Add `rel="noopener noreferrer"` and consider warning users about external links.

---

*Concerns audit: 2026-02-23*
