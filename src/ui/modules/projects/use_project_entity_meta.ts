import { useEffect, useMemo, useState } from "react";
import { readApiPayload } from "@src/common/crud/api_response_utils.ts";
import type { ProjectEntityMeta, ProjectMetaApiResponse } from "@src/ui/modules/projects/projects_types.ts";

let project_meta_cache: ProjectEntityMeta | null = null;
let project_meta_pending_request: Promise<ProjectEntityMeta> | null = null;

async function fetch_project_entity_meta(): Promise<ProjectEntityMeta> {
	if (project_meta_cache) {
		return project_meta_cache;
	}

	if (project_meta_pending_request) {
		return project_meta_pending_request;
	}

	project_meta_pending_request = fetch("/api/projects/meta")
		.then(async (res) => {
			const payload = await readApiPayload<ProjectMetaApiResponse>(
				res,
				"Failed to load project field metadata.",
			);
			if (!payload.data) {
				throw new Error(payload.message ?? "Project metadata payload is missing.");
			}
			return payload.data;
		})
		.then((meta) => {
			project_meta_cache = meta;
			return meta;
		})
		.finally(() => {
			project_meta_pending_request = null;
		});

	return project_meta_pending_request;
}

export function use_project_entity_meta() {
	const [meta, setMeta] = useState<ProjectEntityMeta | null>(project_meta_cache);
	const [is_loading, setIsLoading] = useState(!project_meta_cache);
	const [error_message, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let is_cancelled = false;
		if (project_meta_cache) {
			setMeta(project_meta_cache);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch_project_entity_meta()
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
					error instanceof Error ? error.message : "Failed to load project field metadata.",
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
