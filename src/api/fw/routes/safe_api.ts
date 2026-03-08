import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { ApiRes, type IApiRequestContext, type IApiResult } from "@src/interfaces/route_types.ts";

class ApiRequestContext implements IApiRequestContext {
	private c: Context<{ Bindings: Env }>;

	constructor(c: Context<{ Bindings: Env }>) {
		this.c = c;
	}

	getIpAddress(): string | "" {
		return (
			this.c.req.header("cf-connecting-ip") ??
			this.c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
			""
		);
	}

	async getOrgIdAsync(): Promise<string | null> {
		return this.c.req.header("x-org-id") ?? null;
	}

	async getOrgZoneIdAsync(): Promise<string | null> {
		return this.c.req.header("x-org-zone-id") ?? null;
	}

	async getLocaleAsync(): Promise<"en" | "fa"> {
		const locale = this.c.req.header("x-locale");
		return locale === "fa" ? "fa" : "en";
	}

	async getUserIdAsync(): Promise<string | null> {
		return this.c.req.header("x-user-id") ?? null;
	}
}

function getHttpCode(error: unknown): number {
	if (typeof error === "object" && error !== null && "code" in error) {
		const code = Number((error as { code?: unknown }).code);
		if (Number.isInteger(code) && code >= 400 && code <= 599) {
			return code;
		}
	}

	return 500;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message || "Unexpected server error";
	}

	if (typeof error === "string") {
		return error || "Unexpected server error";
	}

	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string" && message.length > 0) {
			return message;
		}
	}

	return "Unexpected server error";
}

function getErrorType(error: unknown, code: number): string {
	if (typeof error === "object" && error !== null && "errorType" in error) {
		const error_type = (error as { errorType?: unknown }).errorType;
		if (typeof error_type === "string" && error_type.length > 0) {
			return error_type;
		}
	}

	return code === 400 ? "validation_error" : "unknown_error";
}

export async function safeApi<T>(
	c: Context<{ Bindings: Env }>,
	handlerFn: (requestContext: IApiRequestContext) => Promise<IApiResult<T>> | IApiResult<T>,
) {
	try {
		const request_context = new ApiRequestContext(c);
		const result = await handlerFn(request_context);
		const status_code = result.code ?? 200;
		c.status(status_code as ContentfulStatusCode);
		return c.json(result);
	} catch (error) {
		const status_code = getHttpCode(error);
		const error_result = ApiRes.error<null>(
			getErrorMessage(error),
			status_code,
			getErrorType(error, status_code),
		);

		console.error("safeApi error", {
			path: new URL(c.req.url).pathname,
			method: c.req.method,
			ip_address:
				c.req.header("cf-connecting-ip") ??
				c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
				"",
			error,
		});

		c.status(status_code as ContentfulStatusCode);
		return c.json(error_result);
	}
}

