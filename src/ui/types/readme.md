# UI Type Definitions

The `src/ui/types` folder stores UI-specific TypeScript models, including
initial data contracts consumed by rendering and routing logic. These types help
keep component and SSR boundaries explicit and safe.

## Agent Instructions

Keep UI types narrowly scoped to presentation and UI runtime needs, and reuse
shared interfaces when a contract is cross-layer. Maintain strict typing, avoid
runtime logic in type files, and keep names aligned with existing module
conventions.
