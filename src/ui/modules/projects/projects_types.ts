export type Project = {
	id: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
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

export type ProjectsResponse = {
	projects: Project[];
};
