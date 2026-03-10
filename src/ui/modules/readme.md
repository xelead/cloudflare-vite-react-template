# UI Feature Modules

The `src/ui/modules` folder organizes feature-driven React modules by domain,
such as people, projects, and public configuration. Each module should contain
its own components, local data wiring, and type usage so feature logic remains
cohesive.

## Agent Instructions

Follow the existing module-first architecture and keep feature code isolated
inside its module boundary. Reuse shared UI and type contracts where
appropriate, keep components focused, and avoid leaking one module’s internals
into another unless through explicit shared interfaces.
