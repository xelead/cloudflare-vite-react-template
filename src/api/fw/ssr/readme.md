# SSR Route Factory

The `src/api/fw/ssr` folder provides reusable SSR route factories so modules can
define route paths and entity-specific data loaders without duplicating database
lookup and HTML rendering logic.

It also includes `html_page_response.ts`, a shared helper for rendering
app-layout HTML pages for framework-level `404` and `500` responses.
