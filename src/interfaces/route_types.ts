import type { Db } from "mongodb";

export type IAppLocale = "en" | "fa"

export interface IApiReq {
    getContextAsync?(): Promise<IApiRequestContext>
}

export interface IApiRequestContext {
    getIpAddress(): string | ""
    getOrgIdAsync(): Promise<string | null>
    getOrgZoneIdAsync(): Promise<string | null>
    getLocaleAsync(): Promise<IAppLocale>
    getUserIdAsync(): Promise<string | null>
    getCoreDbAsync(): Promise<Db>
    getRequestDataAsync<T extends Record<string, unknown> = Record<string, unknown>>(): Promise<T>
}

export interface IApiResult<T> {
    /* HTTP Status code */
    code?: number
    /* Error code in the form of string */
    errorType?: string
    /* if the API call was successful or not */
    hasError: boolean
    /* Success message or Error message that can be shown to the user */
    message?: string
    /* data that is attached to the result */
    data?: T
    /* Extra notes on the request */
    description?: string
    /* button title of any action that can be done on the API message */
    actionLinkTitle?: string
    /* URL to the UI path for the action link */
    actionLinkUiPath?: string
}

export class ApiRes {
    public static ok<T>(data: T): IApiResult<T> {
        return {
            data,
            code: 200,
            hasError: false,
        }
    }
    public static error<T>(errorMessage: string, code: number, errorType: string): IApiResult<T> {
        return {
            data: null as T,
            hasError: true,
            code,
            errorType,
            message: errorMessage,
        }
    }
    public static validationError<T>(errorMessage: string): IApiResult<T> {
        return {
            data: null as T,
            hasError: true,
            code: 400,
            message: errorMessage,
            errorType: "validation_error",
        }
    }
}

