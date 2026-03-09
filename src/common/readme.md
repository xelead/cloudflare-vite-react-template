# Shared Common Layer

The `src/common` folder contains reusable utilities and generic data contracts
that are intentionally framework-agnostic. This layer supports both API and UI
code by providing stable helpers and shared domain primitives that should remain
free from transport and rendering concerns.

## Agent Instructions

Add only cross-module logic here when it is truly shared and independent of
Hono, React, or Cloudflare runtime details. Keep utilities small, typed, and
composable, and avoid coupling this folder to specific feature modules so this
layer remains portable and predictable.
