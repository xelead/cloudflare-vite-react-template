type ApiErrorPayload = {
	hasError?: boolean;
	message?: string;
	errorType?: string;
	code?: number;
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

	if (statusCode === 400 || normalized.includes("validation")) {
		return "Some fields are invalid. Please review your input and try again.";
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
	if (error instanceof Error) {
		return toFriendlyErrorMessage(error.message);
	}

	if (typeof error === "string" && error.trim().length > 0) {
		return toFriendlyErrorMessage(error);
	}

	return fallback_message;
}

export async function readApiPayload<T extends ApiErrorPayload>(
	response: Response,
	fallback_message: string,
): Promise<T> {
	const raw_body = await response.text();
	let payload: T | null = null;

	if (raw_body.length > 0) {
		try {
			payload = JSON.parse(raw_body) as T;
		} catch {
			if (!response.ok) {
				throw new Error(getTextMessage(raw_body) ?? fallback_message);
			}

			throw new Error(fallback_message);
		}
	}

	if (!payload) {
		if (!response.ok) {
			throw new Error(
				toFriendlyErrorMessage(getTextMessage(raw_body) ?? fallback_message, response.status),
			);
		}

		throw new Error(fallback_message);
	}

	if (!response.ok || payload.hasError) {
		throw new Error(
			toFriendlyErrorMessage(
				payload.message ?? getTextMessage(raw_body) ?? fallback_message,
				payload.code ?? response.status,
			),
		);
	}

	return payload;
}
