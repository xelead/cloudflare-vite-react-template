# Framework Config Helpers

The `src/api/fw/config` folder provides low-level helpers for reading and
normalizing backend environment configuration. It bridges runtime bindings to
typed configuration structures used by the API app.

## Agent Instructions

Keep helpers deterministic and side-effect-light, with clear typing and
defensive handling for missing values. Do not place feature behavior here; this
folder should remain a pure support layer for framework startup and
configuration access.
