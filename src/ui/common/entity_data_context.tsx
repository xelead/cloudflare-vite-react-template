import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";

/**
 * Generic entity data context value.
 */
export interface EntityDataContextValue<T> {
	data: T;
	setData: Dispatch<SetStateAction<T>>;
}

/**
 * Creates a React context and provider for entity data.
 * Similar to create_entity_store but for React state management.
 *
 * @param displayName - The display name for React DevTools
 * @returns An object containing the context, provider, and hook
 */
export function create_entity_data_context<T>(displayName: string) {
	const EntityDataContext = createContext<EntityDataContextValue<T> | null>(null);

	// Set display name for React DevTools
	EntityDataContext.displayName = `${displayName}DataContext`;

	/**
	 * Provider component that wraps children with entity data context.
	 */
	function EntityDataProvider({
		initial_data,
		children,
	}: {
		initial_data: T;
		children: ReactNode;
	}) {
		const [state, setState] = useState<T>(initial_data);

		return (
			<EntityDataContext.Provider value={{ data: state, setData: setState }}>
				{children}
			</EntityDataContext.Provider>
		);
	}

	/**
	 * Hook to access entity data from context.
	 * Returns a default value if used outside provider.
	 */
	function use_entity_data(default_value: T): EntityDataContextValue<T> {
		const context = useContext(EntityDataContext);
		if (context) {
			return context;
		}
		// Return a default context value when used outside provider
		return {
			data: default_value,
			setData: () => {
				console.warn(
					`use_entity_data called outside of ${displayName}DataProvider. ` +
						"State updates will not persist.",
				);
			},
		};
	}

	return {
		EntityDataProvider,
		use_entity_data,
		EntityDataContext,
	};
}

/**
 * Common entity list response type.
 */
export interface EntityListResponse<T> {
	list: T[];
	total?: number;
}

/**
 * Common entity single item response type.
 */
export interface EntityItemResponse<T> {
	item: T;
}

/**
 * Creates a standard entity data context with list storage.
 * This is a convenience factory for the common case of storing a list of entities.
 */
export function create_entity_list_context<T extends { id: string }>(
	displayName: string,
) {
	return create_entity_data_context<{ list: T[] }>(displayName);
}