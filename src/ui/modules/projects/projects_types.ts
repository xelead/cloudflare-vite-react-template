export type Project = {
	id: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
};

export type ApiResult<T> = {
	code?: number;
	errorType?: string;
	hasError: boolean;
	message?: string;
	data?: T;
};

export type ProjectsApiData = {
	list: Project[];
};

export type ProjectsApiResponse = ApiResult<ProjectsApiData>;
export type ProjectApiResponse = ApiResult<Project>;
export type ProjectFieldMeta = {
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
export type ProjectEntityMeta = {
	entityInfo: {
		entityNs: string;
		entityName: string;
		resourceCode: string;
		displayNameFieldName: string;
		entityTitle: string;
		fields: ProjectFieldMeta[];
	};
};
export type ProjectMetaApiResponse = ApiResult<ProjectEntityMeta>;

export type ProjectPatchPayload = {
	name?: string;
	summary?: string;
	year?: number;
	status?: string;
	stack?: string[];
	link?: string;
};

export type ProjectsResponse = {
	projects: Project[];
};
