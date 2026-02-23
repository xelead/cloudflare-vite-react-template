# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**No external APIs detected.**

The application uses a local JSON file for data:
- Data source: `/src/worker/data/projects.json`
- No external fetch calls to third-party services
- Only internal API routes:
  - `GET /api/` - Returns `{ name: "Cloudflare" }`
  - `GET /api/projects` - Returns projects data from JSON file

## Data Storage

**Databases:**
- Not detected - No database connections found

**File Storage:**
- Local JSON file only: `/src/worker/data/projects.json`
- Served via Hono API route (`/api/projects`)
- No external blob/file storage services

**Caching:**
- Not explicitly configured
- Cloudflare Workers platform may provide edge caching for static assets

## Authentication & Identity

**Auth Provider:**
- Not detected - No authentication system implemented

**Authorization:**
- Not detected - No access control mechanisms

## Monitoring & Observability

**Error Tracking:**
- Not detected - No external error tracking service (Sentry, Rollbar, etc.)

**Logs:**
- Cloudflare Workers built-in observability enabled (`observability.enabled: true` in `/wrangler.json`)
- Wrangler tail command: `npx wrangler tail`

**Metrics:**
- Not detected - No custom metrics collection

## CI/CD & Deployment

**Hosting:**
- Cloudflare Workers (`wrangler deploy`)

**CI Pipeline:**
- Not detected - No CI configuration files (GitHub Actions, etc.)

**Build Process:**
- Vite build outputs to `/dist`
- Client assets: `/dist/client`
- Wrangler uploads source maps for debugging

## Environment Configuration

**Required env vars:**
- None detected - No environment variables in use

**Secrets location:**
- Not applicable - No secrets required for current functionality

**Wrangler Configuration:**
- Config file: `/wrangler.json`
- Worker name: `cloudflare-vite-react-template`
- Compatibility date: 2025-10-08
- Node.js compatibility enabled

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Not detected - No outbound webhook calls

## External Links in UI

The Home page (`/src/react-app/pages/Home.tsx`) contains links to external documentation:
- `https://vite.dev` - Vite documentation
- `https://react.dev` - React documentation
- `https://hono.dev/` - Hono framework documentation
- `https://workers.cloudflare.com/` - Cloudflare Workers documentation

Note: These are standard marketing/documentation links, not API integrations.

---

*Integration audit: 2026-02-23*
