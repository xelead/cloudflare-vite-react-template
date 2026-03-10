# Framework Database Primitives

The `src/api/fw/db` folder contains reusable database primitives that support
repositories and persistence patterns across backend modules. It exists to avoid
duplicated low-level database handling and to enforce consistent access
conventions.

## Agent Instructions

Extend this layer only for generic repository and data-access utilities that
multiple modules can share. Keep APIs narrow, typed, and predictable, and avoid
embedding module-specific rules so the framework DB layer remains reusable.
