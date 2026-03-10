import { useState } from "react";
import { Link } from "react-router-dom";
import type { ClientEntityField } from "./entity_utils.ts";
import { render_field_value } from "./entity_utils.ts";

export type ViewMode = "cards" | "table";

export interface EntityListGridProps<T extends { id: string }> {
	/** List of entities to display */
	entities: T[];
	/** Fields to display in the list */
	list_fields: ClientEntityField[];
	/** Entity resource code for API paths (e.g., "projects") */
	entity_code: string;
	/** Field name for the entity title/display name */
	title_field_name: string;
	/** Called when user requests delete */
	on_delete?: (entity: T) => void;
	/** Field name for external link (optional) */
	external_link_field?: string;
	/** Default view mode */
	default_view_mode?: ViewMode;
	/** Whether to persist view mode preference */
	persist_view_mode?: boolean;
}

/**
 * Safely access localStorage in browser environments.
 */
function get_saved_view_mode(storage_key: string, default_mode: ViewMode): ViewMode {
	try {
		if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
			const ls = (globalThis as Record<string, unknown>).localStorage as {
				getItem: (key: string) => string | null;
			} | undefined;
			if (ls) {
				const saved = ls.getItem(storage_key);
				if (saved === "cards" || saved === "table") {
					return saved;
				}
			}
		}
	} catch {
		// localStorage not available
	}
	return default_mode;
}

/**
 * Safely set localStorage in browser environments.
 */
function set_saved_view_mode(storage_key: string, mode: ViewMode): void {
	try {
		if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
			const ls = (globalThis as Record<string, unknown>).localStorage as {
				setItem: (key: string, value: string) => void;
			} | undefined;
			if (ls) {
				ls.setItem(storage_key, mode);
			}
		}
	} catch {
		// localStorage not available
	}
}

/**
 * Reusable grid component for displaying entities.
 * Supports both card and table views with toggle.
 */
export function EntityListGrid<T extends { id: string }>({
	entities,
	list_fields,
	entity_code,
	title_field_name,
	on_delete,
	external_link_field,
	default_view_mode = "cards",
	persist_view_mode = true,
}: EntityListGridProps<T>) {
	const storage_key = `entity_grid_view_${entity_code}`;
	const [view_mode, set_view_mode] = useState<ViewMode>(() => {
		if (persist_view_mode) {
			return get_saved_view_mode(storage_key, default_view_mode);
		}
		return default_view_mode;
	});

	const handle_view_mode_change = (mode: ViewMode) => {
		set_view_mode(mode);
		if (persist_view_mode) {
			set_saved_view_mode(storage_key, mode);
		}
	};

	if (entities.length === 0) {
		return <div className="status-card">No {entity_code} available yet.</div>;
	}

	return (
		<div className="entity-grid-container">
			<div className="view-toggle">
				<button
					type="button"
					className={view_mode === "cards" ? "active" : ""}
					onClick={() => handle_view_mode_change("cards")}
					aria-label="Card view"
				>
					Cards
				</button>
				<button
					type="button"
					className={view_mode === "table" ? "active" : ""}
					onClick={() => handle_view_mode_change("table")}
					aria-label="Table view"
				>
					Table
				</button>
			</div>

			{view_mode === "cards" ? (
				<section className="entity-grid-cards">
					{entities.map((entity) => (
						<EntityCard
							key={entity.id}
							entity={entity}
							list_fields={list_fields}
							entity_code={entity_code}
							title_field_name={title_field_name}
							on_delete={on_delete}
							external_link_field={external_link_field}
						/>
					))}
				</section>
			) : (
				<section className="entity-grid-table">
					<table>
						<thead>
							<tr>
								<th>{title_field_name}</th>
								{list_fields.map((field) => (
									<th key={field.name}>{field.label}</th>
								))}
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{entities.map((entity) => (
								<EntityRow
									key={entity.id}
									entity={entity}
									list_fields={list_fields}
									entity_code={entity_code}
									title_field_name={title_field_name}
									on_delete={on_delete}
									external_link_field={external_link_field}
								/>
							))}
						</tbody>
					</table>
				</section>
			)}
		</div>
	);
}

interface EntityCardProps<T extends { id: string }> {
	entity: T;
	list_fields: ClientEntityField[];
	entity_code: string;
	title_field_name: string;
	on_delete?: (entity: T) => void;
	external_link_field?: string;
}

function EntityCard<T extends { id: string }>({
	entity,
	list_fields,
	entity_code,
	title_field_name,
	on_delete,
	external_link_field,
}: EntityCardProps<T>) {
	const entity_title = render_field_value(entity[title_field_name as keyof T]);
	const external_link = external_link_field
		? String((entity as Record<string, unknown>)[external_link_field] ?? "")
		: null;

	return (
		<article className="entity-card">
			<div className="entity-card-header">
				<h2>{entity_title}</h2>
			</div>
			{list_fields.map((field) => (
				<div className="entity-card-meta" key={`${entity.id}-${field.name}`}>
					<span className="entity-card-label">{field.label}</span>
					<span className="entity-card-value">
						{render_field_value(entity[field.name as keyof T])}
					</span>
				</div>
			))}
			<div className="entity-card-actions">
				<Link className="entity-link" to={`/${entity_code}/${entity.id}`}>
					View details
				</Link>
				<Link className="entity-link" to={`/${entity_code}/${entity.id}/edit`}>
					Edit
				</Link>
				{on_delete && (
					<button
						className="entity-link button-link danger-link"
						type="button"
						onClick={() => on_delete(entity)}
					>
						Delete
					</button>
				)}
				{external_link && external_link.length > 0 && (
					<a className="entity-link" href={external_link} target="_blank" rel="noopener noreferrer">
						Visit
					</a>
				)}
			</div>
		</article>
	);
}

interface EntityRowProps<T extends { id: string }> {
	entity: T;
	list_fields: ClientEntityField[];
	entity_code: string;
	title_field_name: string;
	on_delete?: (entity: T) => void;
	external_link_field?: string;
}

function EntityRow<T extends { id: string }>({
	entity,
	list_fields,
	entity_code,
	title_field_name,
	on_delete,
	external_link_field,
}: EntityRowProps<T>) {
	const entity_title = render_field_value(entity[title_field_name as keyof T]);
	const external_link = external_link_field
		? String((entity as Record<string, unknown>)[external_link_field] ?? "")
		: null;

	return (
		<tr>
			<td>
				<Link to={`/${entity_code}/${entity.id}`}>{entity_title}</Link>
			</td>
			{list_fields.map((field) => (
				<td key={`${entity.id}-${field.name}`}>
					{render_field_value(entity[field.name as keyof T])}
				</td>
			))}
			<td>
				<div className="entity-row-actions">
					<Link className="entity-link" to={`/${entity_code}/${entity.id}/edit`}>
						Edit
					</Link>
					{on_delete && (
						<button
							className="entity-link button-link danger-link"
							type="button"
							onClick={() => on_delete(entity)}
						>
							Delete
						</button>
					)}
					{external_link && external_link.length > 0 && (
						<a
							className="entity-link"
							href={external_link}
							target="_blank"
							rel="noopener noreferrer"
						>
							Visit
						</a>
					)}
				</div>
			</td>
		</tr>
	);
}