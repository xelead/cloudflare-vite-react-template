/**
 * Custom error class that can carry additional debug details from the API
 */
export class ApiError extends Error {
	public readonly code?: number;
	public readonly errorType?: string;
	public readonly debug_details?: Record<string, unknown>;

	constructor(
		message: string,
		options?: {
			code?: number;
			errorType?: string;
			debug_details?: Record<string, unknown>;
		},
	) {
		super(message);
		this.name = "ApiError";
		this.code = options?.code;
		this.errorType = options?.errorType;
		this.debug_details = options?.debug_details;
	}
}

type ApiErrorPayload = {
	hasError?: boolean;
	message?: string;
	errorType?: string;
	code?: number;
	debug_details?: Record<string, unknown>;
};

type ApiRequestContext = {
	request_path?: string;
	request_method?: string;
};

function getTextMessage(raw_body: string): string | null {
	const normalized = raw_body.trim();
	return normalized.length > 0 ? normalized : null;
}

function cleanErrorMessage(message: string): string {
	return message.replace(/^Error:\s*/i, "").trim();
}

function toFriendlyErrorMessage(message: string, statusCode?: number): string {
	const cleaned = cleanErrorMessage(message);
	const normalized = cleaned.toLowerCase();

	if (
		normalized.includes("workers runtime canceled") ||
		normalized.includes("timed out") ||
		normalized.includes("timeout")
	) {
		return "The server took too long to respond. Please try again.";
	}

	if (normalized.includes("networkerror") || normalized.includes("failed to fetch")) {
		return "Unable to connect right now. Check your connection and try again.";
	}

	// Preserve validation error messages - they contain specific field information
	if (statusCode === 400 && normalized.includes("missing required fields")) {
		return cleaned;
	}

	if (statusCode === 400 || normalized.includes("validation")) {
		return cleaned;
	}

	if (statusCode === 404 || normalized.includes("not found")) {
		return "The requested project could not be found.";
	}

	if (statusCode === 409 || normalized.includes("already exists")) {
		return "A conflicting record already exists. Please refresh and try again.";
	}

	if (statusCode && statusCode >= 500) {
		return "A server error occurred while processing your request. Please try again.";
	}

	return cleaned;
}

export function getUserFriendlyErrorMessage(error: unknown, fallback_message: string): string {
	if (error instanceof ApiError) {
		return toFriendlyErrorMessage(error.message, error.code);
	}

	if (error instanceof Error) {
		return toFriendlyErrorMessage(error.message);
	}

	if (typeof error === "string" && error.trim().length > 0) {
		return toFriendlyErrorMessage(error);
	}

	return fallback_message;
}

/**
 * Extracts debug details from an error if available
 */
export function getErrorDebugDetails(error: unknown): Record<string, unknown> | undefined {
	if (error instanceof ApiError) {
		return error.debug_details;
	}
	return undefined;
}

function buildRequestDebugDetails(
	response: Response,
	context?: ApiRequestContext,
): Record<string, unknown> {
	return {
		request_path: context?.request_path ?? response.url ?? "unknown",
		request_method: context?.request_method ?? "GET",
		status: response.status,
		status_text: response.statusText,
	};
}

export function logClientApiError(
	error: unknown,
	context?: {
		request_path?: string;
		request_method?: string;
		operation?: string;
	},
): void {
	const message = error instanceof Error ? error.message : String(error);
	const debug_details = getErrorDebugDetails(error);
	console.error("[client-api] Request failed", {
		operation: context?.operation,
		request_path: context?.request_path ?? debug_details?.request_path ?? "unknown",
		request_method: context?.request_method ?? debug_details?.request_method ?? "GET",
		code: error instanceof ApiError ? error.code : undefined,
		errorType: error instanceof ApiError ? error.errorType : undefined,
		message,
		debug_details,
	});
}

export async function readApiPayload<T extends ApiErrorPayload>(
	response: Response,
	fallback_message: string,
	context?: ApiRequestContext,
): Promise<T> {
	const raw_body = await response.text();
	let payload: T | null = null;

	if (raw_body.length > 0) {
		try {
			payload = JSON.parse(raw_body) as T;
		} catch {
			throw new ApiError(
				toFriendlyErrorMessage(getTextMessage(raw_body) ?? fallback_message, response.status),
				{
					code: response.status,
					errorType: "invalid_json_payload",
					debug_details: {
						...buildRequestDebugDetails(response, context),
						raw_body_preview: raw_body.slice(0, 500),
					},
				},
			);
		}
	}

	if (!payload) {
		throw new ApiError(
			toFriendlyErrorMessage(getTextMessage(raw_body) ?? fallback_message, response.status),
			{
				code: response.status,
				errorType: "empty_payload",
				debug_details: buildRequestDebugDetails(response, context),
			},
		);
	}

	if (!response.ok || payload.hasError) {
		throw new ApiError(
			toFriendlyErrorMessage(
				payload.message ?? getTextMessage(raw_body) ?? fallback_message,
				payload.code ?? response.status,
			),
			{
				code: payload.code ?? response.status,
				errorType: payload.errorType,
				debug_details: {
					...buildRequestDebugDetails(response, context),
					...(payload.debug_details ?? {}),
				},
			},
		);
	}

	return payload;
}
