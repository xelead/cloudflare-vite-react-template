import type { ReactNode } from "react";
import { useState } from "react";
import { getUserFriendlyErrorMessage } from "@src/common/crud/api_response_utils.ts";

export interface DeleteConfirmDialogProps<T> {
	/** The entity being deleted */
	entity: T | null;
	/** Field name to display as the entity title */
	title_field_name: string;
	/** Entity type name for display (e.g., "Project") */
	entity_type_name: string;
	/** Whether delete is in progress */
	is_deleting: boolean;
	/** Error message from failed delete */
	error_message: string | null;
	/** Called when user confirms delete */
	on_confirm: () => void;
	/** Called when user cancels */
	on_cancel: () => void;
	/** Optional children for additional content */
	children?: ReactNode;
}

/**
 * Reusable delete confirmation dialog.
 * Displays entity name and provides confirm/cancel actions.
 */
export function DeleteConfirmDialog<T extends Record<string, unknown>>({
	entity,
	title_field_name,
	entity_type_name,
	is_deleting,
	error_message,
	on_confirm,
	on_cancel,
	children,
}: DeleteConfirmDialogProps<T>) {
	if (!entity) {
		return null;
	}

	const entity_title = String(entity[title_field_name as keyof T] ?? "Unknown");

	return (
		<dialog className="confirm-dialog" open>
			<h2>Delete {entity_type_name}?</h2>
			<p>
				Are you sure you want to delete <strong>{entity_title}</strong>?
			</p>
			{children}
			{error_message && <p className="status-card status-error">{error_message}</p>}
			<div className="dialog-actions">
				<button
					className="danger-button"
					type="button"
					disabled={is_deleting}
					onClick={on_confirm}
				>
					{is_deleting ? "Deleting..." : "Confirm Delete"}
				</button>
				<button type="button" onClick={on_cancel}>
					Cancel
				</button>
			</div>
		</dialog>
	);
}

/**
 * Hook for managing delete confirmation state.
 */
export function useDeleteConfirmation<T extends { id: string }>(
	delete_api_path: (id: string) => string,
	on_success: (id: string) => void,
) {
	const [delete_candidate, set_delete_candidate] = useState<T | null>(null);
	const [is_deleting, set_is_deleting] = useState(false);
	const [error_message, set_error_message] = useState<string | null>(null);

	const start_delete = (entity: T) => {
		set_delete_candidate(entity);
		set_error_message(null);
	};

	const cancel_delete = () => {
		set_delete_candidate(null);
		set_error_message(null);
	};

	const confirm_delete = async () => {
		if (!delete_candidate) {
			return;
		}

		set_is_deleting(true);
		set_error_message(null);

		try {
			const response = await fetch(delete_api_path(delete_candidate.id), {
				method: "DELETE",
			});

			if (!response.ok) {
				const error_data = await response.json().catch(() => ({})) as Record<string, unknown>;
				throw new Error(
					String(error_data.message || `Failed to delete (${response.status})`),
				);
			}

			on_success(delete_candidate.id);
			set_delete_candidate(null);
		} catch (error) {
			set_error_message(
				getUserFriendlyErrorMessage(error, `Failed to delete ${delete_candidate.id}.`),
			);
		} finally {
			set_is_deleting(false);
		}
	};

	return {
		delete_candidate,
		is_deleting,
		error_message,
		start_delete,
		cancel_delete,
		confirm_delete,
		set_error_message,
	};
}