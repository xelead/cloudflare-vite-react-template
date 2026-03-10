# Framework Route Safety Layer

The `src/api/fw/routes` folder implements safe API route abstractions, CORS
integration, and route typing support for backend endpoints. These files
standardize response envelopes, error handling, and route registration behavior
across feature modules.

## Agent Instructions

Preserve the safe-route contract and maintain consistent API result semantics
when editing this folder. Any change here affects all modules, so keep behavior
explicit, compatible, and well-contained, and avoid introducing route logic that
belongs in feature actions.
