# Source Architecture

The `src` folder is the application boundary for both runtime layers. API-side
code lives in `src/api`, UI-side code lives in `src/ui`, cross-cutting contracts
and helpers live in `src/interfaces` and `src/common`, and each area stays
responsible for its own concerns so implementation details do not leak across
layers.

## Agent Instructions

When adding or changing code under `src`, keep separation strict: place backend
behavior in API modules, place presentation and routing behavior in UI modules,
and place shared types/utilities only in dedicated shared folders. Follow
existing naming, keep files focused on a single responsibility, and prefer
extending current module patterns instead of introducing parallel structures.
