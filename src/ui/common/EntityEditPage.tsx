import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	getErrorDebugDetails,
	getUserFriendlyErrorMessage,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import {
	build_form_state,
	get_changed_patch_payload,
	render_field_value,
} from "./entity_utils.ts";
import { use_entity_meta } from "./use_entity_meta.ts";

// Helper to extract value from form element event target
// Workaround for TypeScript 5.8+ where EventTarget is generic
function get_input_value(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): string {
	return (event.target as unknown as { value: string }).value;
}

export interface EntityEditPageProps {
	/** Entity resource code for API paths (e.g., "projects") */
	entity_code: string;
	/** User-friendly entity type name (e.g., "Project") */
	entity_type_name: string;
	/** Optional initial data from SSR */
	initial_data?: Record<string, unknown> | null;
	/** Optional context data for optimistic updates */
	context_data?: { list: Record<string, unknown>[] };
	/** Optional external link field name for the entity */
	external_link_field?: string;
	/** Called after successful update */
	on_updated?: (entity: Record<string, unknown>) => void;
}

/**
 * Generic entity edit page.
 * Fetches entity by ID and renders a metadata-driven edit form.
 */
export function EntityEditPage({
	entity_code,
	entity_type_name,
	initial_data,
	context_data,
	external_link_field,
	on_updated,
}: EntityEditPageProps) {
	const { id } = useParams();
	const navigate = useNavigate();
	const { meta, form_fields, is_loading: is_meta_loading, error_message: meta_error } =
		use_entity_meta(entity_code);

	// Try to find initial entity from SSR data or context
	const initial_entity = useMemo<Record<string, unknown> | null>(() => {
		if (initial_data) {
			return initial_data;
		}
		if (context_data && id) {
			return context_data.list.find((item) => item.id === id) ?? null;
		}
		return null;
	}, [initial_data, context_data, id]);

	const [entity, set_entity] = useState<Record<string, unknown> | null>(initial_entity);
	const [form_state, set_form_state] = useState<Record<string, string>>({});
	const [error_message, set_error_message] = useState<string | null>(null);
	const [error_debug_details, set_error_debug_details] = useState<Record<string, unknown> | null>(null);
	const [is_saving, set_is_saving] = useState(false);
	const [is_loading, set_is_loading] = useState(!initial_entity);

	useEffect(() => {
		if (!initial_entity || form_fields.length === 0) {
			return;
		}

		set_form_state(build_form_state(initial_entity, form_fields));
	}, [form_fields, initial_entity]);

	useEffect(() => {
		set_entity(initial_entity);
	}, [initial_entity]);

	useEffect(() => {
		if (!id) {
			set_entity(null);
			set_error_message(`${entity_type_name} ID is missing.`);
			set_error_debug_details(null);
			set_is_loading(false);
			return;
		}

		if (initial_entity) {
			set_entity(initial_entity);
			if (form_fields.length > 0) {
				set_form_state(build_form_state(initial_entity, form_fields));
			}
			set_error_message(null);
			set_error_debug_details(null);
			set_is_loading(false);
			return;
		}

		let is_cancelled = false;
		set_is_loading(true);

		fetch(`/api/${entity_code}/${encodeURIComponent(id)}`)
			.then(async (res) => {
				const payload = await readApiPayload<
					{ success: boolean; data?: Record<string, unknown>; message?: string }
				>(res, `Failed to load ${entity_code}.`);
				if (!payload.data) {
					throw new Error(payload.message ?? `${entity_type_name} not found.`);
				}
				return payload.data;
			})
			.then((loaded_entity) => {
				if (is_cancelled) {
					return;
				}
				set_entity(loaded_entity);
				if (form_fields.length > 0) {
					set_form_state(build_form_state(loaded_entity, form_fields));
				}
				set_error_message(null);
				set_error_debug_details(null);
			})
			.catch((error: unknown) => {
				if (is_cancelled) {
					return;
				}
				set_entity(null);
				set_error_message(getUserFriendlyErrorMessage(error, `Failed to load ${entity_code}.`));
				set_error_debug_details(getErrorDebugDetails(error) ?? null);
			})
			.finally(() => {
				if (!is_cancelled) {
					set_is_loading(false);
				}
			});

		return () => {
			is_cancelled = true;
		};
	}, [id, entity_code, entity_type_name, initial_entity, form_fields]);

	const title_field_name = meta?.displayNameFieldName ?? "name";

	// ID missing state
	if (!id) {
		return (
			<div className="page">
				<title>{`Edit ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit {entity_type_name}</h1>
						<p>{entity_type_name} ID is missing.</p>
					</div>
				</section>
			</div>
		);
	}

	// Loading metadata state
	if (is_meta_loading) {
		return (
			<div className="page">
				<title>{`Edit ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit {entity_type_name}</h1>
						<p>Loading {entity_code} field metadata...</p>
					</div>
				</section>
			</div>
		);
	}

	// Metadata error state
	if (meta_error) {
		return (
			<div className="page">
				<title>{`Edit ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit {entity_type_name}</h1>
						<p>{meta_error}</p>
					</div>
				</section>
			</div>
		);
	}

	// Loading entity state
	if (is_loading && !entity) {
		return (
			<div className="page">
				<title>{`Edit ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit {entity_type_name}</h1>
						<p>Loading {entity_code}...</p>
					</div>
				</section>
			</div>
		);
	}

	// Not found state
	if (!entity) {
		return (
			<div className="page">
				<title>{`Edit ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit {entity_type_name}</h1>
						<p>{error_message ?? `The requested ${entity_code} could not be found.`}</p>
					</div>
				</section>
				<div className="status-card">
					<Link className="entity-link" to={`/${entity_code}`}>
						Back to {entity_code}
					</Link>
				</div>
			</div>
		);
	}

	const entity_title = render_field_value(entity[title_field_name]);

	const handle_submit = (event: React.FormEvent) => {
		event.preventDefault();
		set_is_saving(true);
		set_error_message(null);
		set_error_debug_details(null);

		const changed_patch = get_changed_patch_payload(entity, form_state, form_fields);

		if (changed_patch.error) {
			set_is_saving(false);
			set_error_message(changed_patch.error);
			return;
		}

		const patch_payload = changed_patch.patch ?? {};
		if (Object.keys(patch_payload).length === 0) {
			set_is_saving(false);
			set_error_message("No changes to save.");
			return;
		}

		fetch(`/api/${entity_code}/${encodeURIComponent(id)}`, {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(patch_payload),
		})
			.then(async (res) => {
				const payload = await readApiPayload<
					{ success: boolean; data?: Record<string, unknown>; message?: string }
				>(res, `Failed to update ${entity_code}.`);
				if (!payload.data) {
					throw new Error(payload.message ?? `Failed to update ${entity_code}.`);
				}
				return payload.data;
			})
			.then((updated_entity) => {
				set_entity(updated_entity);
				set_form_state(build_form_state(updated_entity, form_fields));
				on_updated?.(updated_entity);
				navigate(`/${entity_code}/${id}`);
			})
			.catch((error: unknown) => {
				set_error_message(getUserFriendlyErrorMessage(error, `Failed to update ${entity_code}.`));
				set_error_debug_details(getErrorDebugDetails(error) ?? null);
			})
			.finally(() => {
				set_is_saving(false);
			});
	};

	return (
		<div className="page">
			<title>{`Edit ${entity_title}`}</title>
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{`Edit ${meta?.entityTitle ?? entity_type_name}`}</h1>
					<p>Update {entity_code} metadata and publish changes.</p>
				</div>
			</section>

			<form className="entity-form" onSubmit={handle_submit}>
				{form_fields.map((field) => {
					const input_value = form_state[field.name] ?? "";
					const input_type = field.jsonDataType === "number" ? "number" : "text";
					const is_textarea = field.jsonDataType === "string" && field.formFieldProps.isFullWidth;

					const handle_change = (next_value: string) => {
						set_form_state((current) => ({
							...current,
							[field.name]: next_value,
						}));
					};

					return (
						<label className="field" key={field.name}>
							<span>{field.label}</span>
							{is_textarea ? (
								<textarea
									required={field.isRequired}
									value={input_value}
									onChange={(e) => handle_change(get_input_value(e))}
								/>
							) : (
								<input
									required={field.isRequired}
									type={input_type}
									value={input_value}
									onChange={(e) => handle_change(get_input_value(e))}
								/>
							)}
						</label>
					);
				})}

				{error_message && (
					<div className="status-card status-error">
						<p>{error_message}</p>
						{error_debug_details && (
							<details className="error-details">
								<summary>Debug Details</summary>
								<pre>{JSON.stringify(error_debug_details, null, 2)}</pre>
							</details>
						)}
					</div>
				)}

				<div className="entity-form-actions">
					<button disabled={is_saving} type="submit">
						{is_saving ? "Saving..." : "Save Changes"}
					</button>
					<Link className="entity-link" to={`/${entity_code}/${id}`}>
						Cancel
					</Link>
					{external_link_field && typeof entity[external_link_field] === "string" && entity[external_link_field] && (
						<a
							className="entity-link"
							href={String(entity[external_link_field])}
							target="_blank"
							rel="noopener noreferrer"
						>
							View External
						</a>
					)}
				</div>
			</form>
		</div>
	);
}

/**
 * Creates a bound EntityEditPage component for a specific entity.
 */
export function create_entity_edit_page(
	entity_code: string,
	entity_type_name: string,
	options?: {
		external_link_field?: string;
		on_updated?: (entity: Record<string, unknown>) => void;
	},
) {
	return function BoundEntityEditPage(props: {
		initial_data?: Record<string, unknown> | null;
		context_data?: { list: Record<string, unknown>[] };
	}) {
		return (
			<EntityEditPage
				entity_code={entity_code}
				entity_type_name={entity_type_name}
				external_link_field={options?.external_link_field}
				on_updated={options?.on_updated}
				{...props}
			/>
		);
	};
}