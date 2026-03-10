import { useEffect, useMemo, useState } from "react";
import { readApiPayload } from "@src/common/crud/api_response_utils.ts";
import type { ClientEntityField, ClientEntityMeta, EntityMetaApiResponse } from "./entity_utils.ts";

// Global cache for entity metadata by entity code
const meta_cache: Map<string, ClientEntityMeta> = new Map();
const pending_requests: Map<string, Promise<ClientEntityMeta>> = new Map();

/**
 * Fetches entity metadata from the API.
 * Uses caching to avoid redundant requests.
 */
async function fetch_entity_meta(entity_code: string): Promise<ClientEntityMeta> {
	const cached = meta_cache.get(entity_code);
	if (cached) {
		return cached;
	}

	const pending = pending_requests.get(entity_code);
	if (pending) {
		return pending;
	}

	const request = fetch(`/api/${entity_code}/meta`)
		.then(async (res) => {
			const payload = await readApiPayload<EntityMetaApiResponse>(
				res,
				`Failed to load ${entity_code} field metadata.`,
			);
			if (!payload.data) {
				throw new Error(payload.message ?? `${entity_code} metadata payload is missing.`);
			}
			return payload.data;
		})
		.then((meta) => {
			meta_cache.set(entity_code, meta);
			return meta;
		})
		.finally(() => {
			pending_requests.delete(entity_code);
		});

	pending_requests.set(entity_code, request);
	return request;
}

/**
 * Hook return type for entity metadata.
 */
export interface UseEntityMetaResult {
	meta: ClientEntityMeta | null;
	list_fields: ClientEntityField[];
	form_fields: ClientEntityField[];
	is_loading: boolean;
	error_message: string | null;
}

/**
 * Hook for fetching and caching entity metadata.
 * Returns list_fields and form_fields derived from the metadata.
 */
export function use_entity_meta(entity_code: string): UseEntityMetaResult {
	const [meta, setMeta] = useState<ClientEntityMeta | null>(() => meta_cache.get(entity_code) ?? null);
	const [is_loading, setIsLoading] = useState(() => !meta_cache.has(entity_code));
	const [error_message, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let is_cancelled = false;
		const cached = meta_cache.get(entity_code);
		if (cached) {
			setMeta(cached);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch_entity_meta(entity_code)
			.then((loaded_meta) => {
				if (is_cancelled) {
					return;
				}
				setMeta(loaded_meta);
				setErrorMessage(null);
			})
			.catch((error: unknown) => {
				if (is_cancelled) {
					return;
				}
				setErrorMessage(
					error instanceof Error ? error.message : `Failed to load ${entity_code} field metadata.`,
				);
			})
			.finally(() => {
				if (!is_cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			is_cancelled = true;
		};
	}, [entity_code]);

	const list_fields = useMemo(() => {
		return meta?.fields?.filter((field) => field.listFieldProps.visible) ?? [];
	}, [meta]);

	const form_fields = useMemo(() => {
		return (
			meta?.fields?.filter((field) => field.formFieldProps.visible && !field.isReadOnly) ?? []
		);
	}, [meta]);

	return { meta, list_fields, form_fields, is_loading, error_message };
}

/**
 * Factory function that creates a hook bound to a specific entity code.
 * Useful for creating entity-specific hooks like use_project_entity_meta.
 */
export function create_use_entity_meta(entity_code: string) {
	return function use_bound_entity_meta(): UseEntityMetaResult {
		return use_entity_meta(entity_code);
	};
}