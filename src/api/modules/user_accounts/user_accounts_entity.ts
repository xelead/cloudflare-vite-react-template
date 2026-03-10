import user_accounts_fields_json from "@src/api/modules/user_accounts/user_accounts_fields.json" assert { type: "json" };
import {
	build_entity_fields_from_json,
	type EntityFieldDefinitionJson,
} from "@src/common/crud/entity_field_definition_loader.ts";

export const entity_res_code = "userAccounts";

export const fields = build_entity_fields_from_json(
	user_accounts_fields_json as EntityFieldDefinitionJson[],
);
