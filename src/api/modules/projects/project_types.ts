import { EntityFieldMaker } from "@src/common/crud/entity_field_maker.ts";
import type { IEntityFieldInfo } from "@src/common/crud/entity_interfaces.ts";

export interface IProject {
	id: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: Array<string>;
	link?: string;
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
}

export interface IProjectList {
	list: Array<IProject>;
	total?: number;
	pageNumber?: number;
	pageSize?: number;
}

/**
 * Project field definitions - typed for compile-time safety
 */
export const PROJECT_FIELDS: Record<keyof IProject, IEntityFieldInfo> = {
	id: EntityFieldMaker.getId(),

	name: {
		...EntityFieldMaker.getString("name", "Name"),
		isRequired: true,
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	summary: {
		...EntityFieldMaker.getString("summary", "Summary"),
		isRequired: true,
		formFieldProps: {
			visible: true,
			isFullWidth: true,
		},
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	year: {
		...EntityFieldMaker.getInt32("year", "Year"),
		isRequired: true,
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	status: {
		...EntityFieldMaker.getString("status", "Status"),
		isRequired: true,
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	stack: {
		...EntityFieldMaker.getStringArray("stack", "Stack"),
		isRequired: true,
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	link: {
		...EntityFieldMaker.getString("link", "Link"),
		listFieldProps: {
			visible: false,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	created_at: {
		...EntityFieldMaker.getDate("created_at", "Created At"),
		storageDataType: "timestamp",
		isReadOnly: true,
		formFieldProps: {
			visible: false,
			isFullWidth: false,
		},
		listFieldProps: {
			visible: false,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	updated_at: {
		...EntityFieldMaker.getDate("updated_at", "Updated At"),
		storageDataType: "timestamp",
		isReadOnly: true,
		formFieldProps: {
			visible: false,
			isFullWidth: false,
		},
		listFieldProps: {
			visible: false,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	deleted_at: {
		...EntityFieldMaker.getDate("deleted_at", "Deleted At"),
		storageDataType: "timestamp",
		isReadOnly: true,
		formFieldProps: {
			visible: false,
			isFullWidth: false,
		},
		listFieldProps: {
			visible: false,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},
};

/**
 * Field order for the entity - defines the order fields appear in forms and lists
 */
export const PROJECT_FIELD_ORDER: Array<keyof IProject> = [
	"id",
	"name",
	"summary",
	"year",
	"status",
	"stack",
	"link",
	"created_at",
	"updated_at",
	"deleted_at",
];