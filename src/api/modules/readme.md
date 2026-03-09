# API Feature Modules

The `src/api/modules` folder is where feature-oriented backend modules are
organized. Each module owns its API routes and action logic so domain behavior
stays cohesive, testable, and isolated from unrelated features.

## Agent Instructions

Create or modify modules using the established module-per-domain pattern with
thin route files and focused action files. Reuse shared response and safety
abstractions from `src/api/fw`, keep module boundaries clear, and avoid
cross-module coupling unless it is expressed through stable shared interfaces.
