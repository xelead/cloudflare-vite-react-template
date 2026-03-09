# Common Utility Functions

The `src/common/utils` folder contains generic utility functions such as
date-time and file-name helpers that can be used across the application. These
helpers are intentionally small and reusable to keep module code focused on
business behavior.

## Agent Instructions

Add utilities here only when they are truly cross-cutting and not tied to one
feature or framework. Keep function signatures clear, avoid hidden side effects,
and maintain existing utility style so consumption stays straightforward across
modules.
