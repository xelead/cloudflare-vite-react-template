# User Accounts Module

Defines `userAccounts` entity fields from JSON in `user_accounts_fields.json`,
then materializes runtime field objects via
`build_entity_fields_from_json(...)`.

This avoids large in-code `FM.getX(...)` blocks and keeps field metadata
editable as data.
