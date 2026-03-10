export type HttpApiMethods = "GET" | "POST" | "PATCH" | "DELETE"

export interface IApiRoute {
  method: HttpApiMethods
  path: string
  isMultiTenant?: boolean
  apiAsyncFn: Function<IApiResult>
  regEx?: RegExp
}

export interface IRouteMatchResult {
  route: IApiRoute
  params: Record<string, string>
  reqPath: string
}

export interface IRouteManager {
  register_routes: (route: IApiRoute) => void
  match: (path: string, method: string) => IRouteMatchResult | null
}
