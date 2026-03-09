# Framework Utility Helpers

The `src/api/fw/utils` folder stores backend framework helper utilities used by
routing and infrastructure code. These helpers reduce duplication while keeping
framework code concise and maintainable.

## Agent Instructions

Add only generic utilities that are reused across framework components, and keep
function behavior narrow and well typed. If a utility is feature-specific, place
it in that module instead of this shared framework utility layer.
