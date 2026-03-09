# Public Config API Module

Exposes `/api/publicconfig`, returning all worker environment values whose keys
start with `NEXT_PUBLIC_`.

Implementation pattern:

- Route registration lives in `publicconfig_api_routes.ts` and extends
  `SafeApiRouteModule`.
- Endpoint logic lives in `actions/publicconfig_get.ts`.
- Action returns the standard `IApiResult` response shape via `ApiRes`.
