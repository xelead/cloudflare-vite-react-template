export type Project = {
	id: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
};

export type ProjectsResponse = {
	projects: Project[];
};
