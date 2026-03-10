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

export type PersonFieldMeta = {
	name: string;
	label: string;
	jsonDataType: "string" | "boolean" | "number" | "array";
	storageDataType:
		| "string"
		| "float"
		| "int"
		| "int64"
		| "boolean"
		| "timestamp"
		| "double"
		| "double[]";
	isRequired: boolean;
	isReadOnly: boolean;
	formFieldProps: {
		visible: boolean;
		isFullWidth: boolean;
	};
	listFieldProps: {
		visible: boolean;
		canInlineEdit: boolean;
		canSortInListView: boolean;
		canFilterInListView: boolean;
	};
};

export type PersonEntityMeta = {
	entityInfo: {
		entityNs: string;
		entityName: string;
		resourceCode: string;
		displayNameFieldName: string;
		entityTitle: string;
		fields: PersonFieldMeta[];
	};
};

export type ApiResult<T> = {
	code?: number;
	errorType?: string;
	hasError: boolean;
	message?: string;
	data?: T;
};

export type PeopleApiData = {
	list: IPerson[];
	total: number;
	pageNumber: number;
	pageSize: number;
};

export type PeopleApiResponse = ApiResult<PeopleApiData>;
export type PersonApiResponse = ApiResult<IPerson>;
export type PersonMetaApiResponse = ApiResult<PersonEntityMeta>;

export type PeopleResponse = {
	people: IPerson[];
};