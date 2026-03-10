import { useEffect, useMemo, useState } from "react";
import { readApiPayload } from "@src/common/crud/api_response_utils.ts";
import type { PersonEntityMeta, PersonMetaApiResponse } from "@src/ui/modules/people/people_types.ts";

let people_meta_cache: PersonEntityMeta | null = null;
let people_meta_pending_request: Promise<PersonEntityMeta> | null = null;

async function fetch_people_entity_meta(): Promise<PersonEntityMeta> {
	if (people_meta_cache) {
		return people_meta_cache;
	}

	if (people_meta_pending_request) {
		return people_meta_pending_request;
	}

	people_meta_pending_request = fetch("/api/people/meta")
		.then(async (res) => {
			const payload = await readApiPayload<PersonMetaApiResponse>(
				res,
				"Failed to load people field metadata.",
			);
			if (!payload.data) {
				throw new Error(payload.message ?? "People metadata payload is missing.");
			}
			return payload.data;
		})
		.then((meta) => {
			people_meta_cache = meta;
			return meta;
		})
		.finally(() => {
			people_meta_pending_request = null;
		});

	return people_meta_pending_request;
}

export function use_people_entity_meta() {
	const [meta, setMeta] = useState<PersonEntityMeta | null>(people_meta_cache);
	const [is_loading, setIsLoading] = useState(!people_meta_cache);
	const [error_message, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let is_cancelled = false;
		if (people_meta_cache) {
			setMeta(people_meta_cache);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch_people_entity_meta()
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
					error instanceof Error ? error.message : "Failed to load people field metadata.",
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
	}, []);

	const list_fields = useMemo(() => {
		return meta?.entityInfo.fields.filter((field) => field.listFieldProps.visible) ?? [];
	}, [meta]);

	const form_fields = useMemo(() => {
		return (
			meta?.entityInfo.fields.filter((field) => field.formFieldProps.visible && !field.isReadOnly) ?? []
		);
	}, [meta]);

	return { meta, list_fields, form_fields, is_loading, error_message };
}