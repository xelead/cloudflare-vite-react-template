import { EntityFieldMaker } from "@src/common/crud/entity_field_maker.ts";
import type { IEntityFieldInfo } from "@src/common/crud/entity_interfaces.ts";

export interface IPerson {
	id: string;
	name: string;
	role: string;
	location: string;
	status: string;
	skills: string[];
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
}

export interface IPersonList {
	list: Array<IPerson>;
	total?: number;
	pageNumber?: number;
	pageSize?: number;
}

/**
 * People field definitions - typed for compile-time safety
 */
export const PEOPLE_FIELDS: Record<keyof IPerson, IEntityFieldInfo> = {
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

	role: {
		...EntityFieldMaker.getString("role", "Role"),
		isRequired: true,
		listFieldProps: {
			visible: true,
			canInlineEdit: false,
			canSortInListView: false,
			canFilterInListView: false,
		},
	},

	location: {
		...EntityFieldMaker.getString("location", "Location"),
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

	skills: {
		...EntityFieldMaker.getStringArray("skills", "Skills"),
		isRequired: true,
		listFieldProps: {
			visible: true,
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
export const PEOPLE_FIELD_ORDER: Array<keyof IPerson> = [
	"id",
	"name",
	"role",
	"location",
	"status",
	"skills",
	"created_at",
	"updated_at",
	"deleted_at",
];
