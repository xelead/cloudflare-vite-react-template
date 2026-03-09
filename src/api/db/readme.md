# API Database Integration

The `src/api/db` folder contains data access initialization and database-level
integration points used by backend modules. It provides shared database setup
that feature actions can rely on without duplicating connection or repository
bootstrapping logic.

## Agent Instructions

Centralize connection and repository wiring in this folder and keep
feature-specific query logic in module actions or repositories. Follow existing
database abstractions, guard against runtime failures, and preserve clear
boundaries between infrastructure and business behavior.
