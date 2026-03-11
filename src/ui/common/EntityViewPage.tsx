import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	getUserFriendlyErrorMessage,
	logClientApiError,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import { render_field_value } from "./entity_utils.ts";
import { use_entity_meta } from "./use_entity_meta.ts";

export interface EntityViewPageProps {
	/** Entity resource code for API paths (e.g., "projects") */
	entity_code: string;
	/** User-friendly entity type name (e.g., "Project") */
	entity_type_name: string;
	/** Optional initial data from SSR */
	initial_data?: Record<string, unknown> | null;
	/** Optional context data for optimistic updates */
	context_data?: { list: Record<string, unknown>[] };
	/** Optional field name for external link (e.g., "link") */
	external_link_field?: string;
}

/**
 * Generic entity view/details page.
 * Fetches entity by ID and displays fields using metadata.
 */
export function EntityViewPage({
	entity_code,
	entity_type_name,
	initial_data,
	context_data,
	external_link_field,
}: EntityViewPageProps) {
	const { id } = useParams();
	const { meta, list_fields, is_loading: is_meta_loading } = use_entity_meta(entity_code);

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
	const [is_loading, set_is_loading] = useState(!initial_entity);
	const [error_message, set_error_message] = useState<string | null>(null);

	useEffect(() => {
		set_entity(initial_entity);
	}, [initial_entity]);

	useEffect(() => {
		if (!id) {
			set_entity(null);
			set_error_message(`${entity_type_name} ID is missing.`);
			return;
		}

		if (initial_entity) {
			set_entity(initial_entity);
			set_error_message(null);
			return;
		}

		let is_cancelled = false;
		set_is_loading(true);
		set_error_message(null);
		const request_path = `/api/${entity_code}/${encodeURIComponent(id)}`;

		fetch(request_path)
			.then(async (res) => {
				const payload = await readApiPayload<
					{ success: boolean; data?: Record<string, unknown>; message?: string }
				>(res, `Failed to load ${entity_code}.`, {
					request_path,
					request_method: "GET",
				});
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
				set_error_message(null);
			})
			.catch((error: unknown) => {
				if (is_cancelled) {
					return;
				}
				logClientApiError(error, {
					operation: `load_${entity_code}_details`,
					request_path,
					request_method: "GET",
				});
				set_entity(null);
				set_error_message(getUserFriendlyErrorMessage(error, `Failed to load ${entity_code}.`));
			})
			.finally(() => {
				if (!is_cancelled) {
					set_is_loading(false);
				}
			});

		return () => {
			is_cancelled = true;
		};
	}, [id, entity_code, entity_type_name, initial_entity]);

	const title_field_name = meta?.displayNameFieldName ?? "name";

	// Loading state
	if (is_meta_loading || (is_loading && !entity)) {
		return (
			<div className="page">
				<title>{`Loading ${entity_type_name}`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Loading {entity_type_name}</h1>
						<p>Fetching {entity_code} details from API.</p>
					</div>
				</section>
			</div>
		);
	}

	// Not found state
	if (!entity) {
		return (
			<div className="page">
				<title>{`${entity_type_name} Not Found`}</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>{entity_type_name} Not Found</h1>
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

	return (
		<div className="page">
			<title>{entity_title}</title>
			<meta name="description" content={entity_title} />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{entity_title}</h1>
					<p>
						{meta?.entityTitle ?? entity_type_name} details rendered from entity metadata.
					</p>
					{external_link_field && typeof entity[external_link_field] === "string" && entity[external_link_field] && (
						<p>
							<a
								className="external-link"
								href={String(entity[external_link_field])}
								target="_blank"
								rel="noopener noreferrer"
							>
								View External ↗
							</a>
						</p>
					)}
				</div>
			</section>
			<article className="entity-card">
				<div className="entity-card-header">
					<div>
						<h2>{entity_type_name} Overview</h2>
					</div>
				</div>
				{list_fields.map((field) => (
					<div className="entity-card-meta" key={field.name}>
						<span className="entity-card-label">{field.label}</span>
						<span className="entity-card-value">
							{render_field_value(entity[field.name])}
						</span>
					</div>
				))}
				<div className="entity-card-actions">
					<Link className="entity-link" to={`/${entity_code}`}>
						Back to {entity_code}
					</Link>
					<Link className="entity-link" to={`/${entity_code}/${id}/edit`}>
						Edit {entity_type_name.toLowerCase()}
					</Link>
				</div>
			</article>
		</div>
	);
}

/**
 * Creates a bound EntityViewPage component for a specific entity.
 */
export function create_entity_view_page(
	entity_code: string,
	entity_type_name: string,
) {
	return function BoundEntityViewPage(props: {
		initial_data?: Record<string, unknown> | null;
		context_data?: { list: Record<string, unknown>[] };
	}) {
		return (
			<EntityViewPage
				entity_code={entity_code}
				entity_type_name={entity_type_name}
				{...props}
			/>
		);
	};
}
