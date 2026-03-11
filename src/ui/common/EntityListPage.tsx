import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	getUserFriendlyErrorMessage,
	logClientApiError,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import { app_name } from "./app_name.ts";
import { DeleteConfirmDialog, useDeleteConfirmation } from "./DeleteConfirmDialog.tsx";
import { EntityListGrid } from "./EntityListGrid.tsx";
import { use_entity_meta } from "./use_entity_meta.ts";

export interface EntityListPageProps<T extends { id: string }> {
	/** Entity resource code for API paths (e.g., "projects") */
	entity_code: string;
	/** User-friendly entity type name (e.g., "Project") */
	entity_type_name: string;
	/** Initial list data from SSR */
	initial_data?: T[];
	/** Current list data (from context) */
	data?: T[];
	/** Callback when list is updated (e.g., after fetch or delete) */
	on_data_change?: (new_list: T[]) => void;
	/** Optional context data for optimistic updates */
	context_data?: { list: T[]; setData: (update: { list: T[] } | ((prev: { list: T[] }) => { list: T[] })) => void };
	/** Optional external link field name */
	external_link_field?: string;
	/** Optional page description */
	description?: string;
	/** Whether to show create button */
	show_create?: boolean;
}

/**
 * Generic entity list page.
 * Handles data fetching, display with grid/cards toggle, and delete confirmation.
 */
export function EntityListPage<T extends { id: string }>({
	entity_code,
	entity_type_name,
	initial_data,
	data,
	on_data_change,
	context_data,
	external_link_field,
	description,
	show_create = false,
}: EntityListPageProps<T>) {
	const { meta, list_fields, is_loading: is_meta_loading } = use_entity_meta(entity_code);
	const [local_data, set_local_data] = useState<T[]>(initial_data ?? []);
	const [has_fetched, set_has_fetched] = useState(false);
	const [fetch_error, set_fetch_error] = useState<string | null>(null);

	// Use provided data if available, context data, or local state
	const entities = data ?? context_data?.list ?? local_data;

	const title_field_name = meta?.displayNameFieldName ?? "name";

	// Fetch entities on mount if not provided
	useEffect(() => {
		if (entities.length > 0 || has_fetched || initial_data) {
			return;
		}

		set_has_fetched(true);
		const request_path = `/api/${entity_code}`;
		fetch(request_path)
			.then(async (res) => {
				const payload = await readApiPayload<
					{ success: boolean; data?: { list: T[] }; message?: string }
				>(res, `Failed to load ${entity_code}.`, {
					request_path,
					request_method: "GET",
				});
				return payload.data?.list ?? [];
			})
			.then((list) => {
				if (on_data_change) {
					on_data_change(list);
				} else if (context_data) {
					context_data.setData({ list });
				} else {
					set_local_data(list);
				}
				set_fetch_error(null);
			})
			.catch((error: unknown) => {
				logClientApiError(error, {
					operation: `load_${entity_code}_list`,
					request_path,
					request_method: "GET",
				});
				set_fetch_error(getUserFriendlyErrorMessage(error, `Failed to load ${entity_code}.`));
			});
	}, [entity_code, entities.length, has_fetched, initial_data, on_data_change, context_data]);

	// Delete handling
	const {
		delete_candidate,
		is_deleting,
		error_message: delete_error,
		start_delete,
		cancel_delete,
		confirm_delete,
	} = useDeleteConfirmation<T>(
		(id) => `/api/${entity_code}/${encodeURIComponent(id)}`,
		(deleted_id) => {
			const new_list = entities.filter((e) => e.id !== deleted_id);
			if (on_data_change) {
				on_data_change(new_list);
			} else if (context_data) {
				context_data.setData({ list: new_list });
			} else {
				set_local_data(new_list);
			}
		},
	);

	return (
		<div className="page">
			<title>{`${entity_type_name}s | ${app_name}`}</title>
			<meta
				name="description"
				content={description ?? `Explore ${entity_code} loaded from the API.`}
			/>
			<meta property="og:title" content={`${entity_type_name}s | ${app_name}`} />
			<meta
				property="og:description"
				content={description ?? `Explore ${entity_code} loaded from the API.`}
			/>
			<meta property="og:type" content="website" />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{meta?.entityTitle ?? `${entity_type_name}s`}</h1>
					<p>{description ?? `${entity_type_name}s served from the API-powered JSON endpoint.`}</p>
				</div>
			</section>

			{is_meta_loading && (
				<div className="status-card">Loading {entity_code} field metadata...</div>
			)}

			{fetch_error && (
				<div className="status-card status-error">{fetch_error}</div>
			)}

			{!is_meta_loading && entities.length === 0 && !fetch_error && (
				<div className="status-card">No {entity_code} available yet.</div>
			)}

			{entities.length > 0 && (
				<EntityListGrid
					entities={entities}
					list_fields={list_fields}
					entity_code={entity_code}
					title_field_name={title_field_name}
					on_delete={start_delete}
					external_link_field={external_link_field}
				/>
			)}

			{show_create && (
				<div className="entity-form-actions">
					<Link className="entity-link" to={`/${entity_code}/new`}>
						Create {entity_type_name}
					</Link>
				</div>
			)}

			<DeleteConfirmDialog
				entity={delete_candidate}
				title_field_name={title_field_name}
				entity_type_name={entity_type_name}
				is_deleting={is_deleting}
				error_message={delete_error}
				on_confirm={confirm_delete}
				on_cancel={cancel_delete}
			/>
		</div>
	);
}

/**
 * Creates a bound EntityListPage component for a specific entity.
 */
export function create_entity_list_page<T extends { id: string }>(
	entity_code: string,
	entity_type_name: string,
	options?: {
		external_link_field?: string;
		description?: string;
		show_create?: boolean;
	},
) {
	return function BoundEntityListPage(props: {
		initial_data?: T[];
		data?: T[];
		on_data_change?: (new_list: T[]) => void;
	}) {
		return (
			<EntityListPage
				entity_code={entity_code}
				entity_type_name={entity_type_name}
				external_link_field={options?.external_link_field}
				description={options?.description}
				show_create={options?.show_create}
				{...props}
			/>
		);
	};
}
