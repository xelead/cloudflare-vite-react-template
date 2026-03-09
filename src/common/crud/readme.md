# CRUD Contracts and Filters

The `src/common/crud` folder provides shared CRUD interfaces and filter
expression types used across modules. It defines reusable query and entity
contracts so API actions and consumers can share a common language for list and
mutation behavior.

It also includes `entity_field_definition_loader.ts`, which converts JSON
field-definition files into runtime `IEntityFieldInfo` maps using
`EntityFieldMaker`.

## Agent Instructions

Treat this folder as shared domain contract infrastructure and keep changes
additive and predictable. Maintain strong typing, avoid runtime-heavy logic, and
preserve compatibility for modules that already rely on these CRUD and filter
definitions.
