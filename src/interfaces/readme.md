# Shared Interfaces

The `src/interfaces` folder defines common TypeScript contracts used across
modules, including route/event/common type models. These files establish
compile-time agreements between layers and reduce duplicate type definitions
across API handlers, module actions, and UI consumers.

## Agent Instructions

Update interfaces in a backward-aware way and treat these files as stable
contracts first, implementation details second. Keep types explicit, avoid
embedding runtime logic in interface files, and align new contract names with
existing patterns to preserve consistency across the codebase.
