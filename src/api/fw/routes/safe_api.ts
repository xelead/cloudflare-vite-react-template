import { Hono } from "hono";

import ApiValidationError, {IApiReq, IApiRes, IApiRequestContext, ApiError} from "@src/interfaces/route_types.ts";
export type IApp = Hono<{ Bindings: Env }>;

export interface ApiReq extends Hono, IApiReq {
    getContextAsync(): Promise<IApiRequestContext>
}
export interface ApiRes extends Hono, IApiRes {}

/**
 * The main goal of this handler is to make sure that the API does not throw any unhandled exception.
 * Next.js will return HTTP page instead of a json value
 * So, we need to make sure that the exceptions are converted to IApiResult before responding to the user.
 * @param req
 * @param res
 * @param handlerFn
 */
export function safeApi(req: ApiReq, res: ApiRes, handlerFn: Function) {
    try {
        const reqContext = new ApiRequestContext(req)
        transformReq(req)
        const result = handlerFn(req, res, reqContext)
        if (result instanceof Promise)
            result.catch((e) => {
                handleApiError(e, res)
            })
        return result
    } catch (e) {
        handleApiError(e, res)
    }
    return {}
}



/**
 * Sets API error in response object
 * @param {Object} error - all types of errors
 * @param res - response
 */
export default function handleApiError(error: any, res: NextApiResponse) {
    switch (true) {
        case error instanceof ApiError:
            res.status(400)
            res.json(error)
            break

        case typeof error === "string": {
            const apiError = new ApiError("Unknown Error", 500, "UNKNOWN_ERROR")
            res.status(500)
            res.json(apiError)
            break
        }

        case error instanceof ApiValidationError:
            res.status(error.code)
            res.json(error)
            break

        case error instanceof Error: {
            const apiError = new ApiError(error.message, 500, error)
            res.status(500)
            res.json(apiError)
            break
        }

        default:
            res.status(500)
            res.json(new ApiError("Unknown Error in Server", 500, error))
    }
}

export default function getConstructorName(value: any): string {
    if (value === undefined || value === null || value.constructor === undefined) {
        return "undefined"
    }

    return value.constructor.name
}

