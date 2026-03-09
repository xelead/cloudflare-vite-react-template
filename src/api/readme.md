# Backend API Module

This API module provides backend routes for project-related operations. It
includes routes for server-side rendering (SSR) and API requests.

## Adding New API Endpoints

Use this pattern for all new API endpoints:

1. Add an action under `src/api/modules/<module_name>/actions/` with a
   focused function per endpoint (for example `users_get.ts`).
2. Return `IApiResult<T>` from the action using `ApiRes.ok`,
   `ApiRes.validationError`, or `ApiRes.error`.
3. Register the route in
   `src/api/modules/<module_name>/<module_name>_api_routes.ts` by extending
   `SafeApiRouteModule`.
4. In route registration, call the action from
   `this.get/post/patch/delete(...)` and only keep routing concerns there
   (headers, path params wiring).
5. Keep route files thin and put business logic in action files.
