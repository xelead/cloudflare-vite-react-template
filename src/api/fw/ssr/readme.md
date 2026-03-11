# SSR Route Factory

The `src/api/fw/ssr` folder provides reusable SSR route factories so modules can
define route paths and entity-specific data loaders without duplicating database
lookup and HTML rendering logic.

It also includes `html_page_response.ts`, a shared helper for rendering
app-layout HTML pages for framework-level `404` and `500` responses.

`client_asset_urls.ts` resolves the built client script and stylesheet URLs
from `index.html` in the assets binding so SSR pages load hashed production
bundles without hardcoded file names.
