# API Configuration Contracts

The `src/api/config` folder stores configuration type definitions used by the
backend runtime. These definitions represent the expected environment shape and
provide a typed entry point for reading deployment configuration safely.

## Agent Instructions

Keep this folder focused on configuration contracts and validation-oriented
typing. Avoid business logic here, ensure every config field is clearly typed
and named, and keep changes compatible with existing environment-loading helpers
in the API framework.
