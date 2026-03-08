import { type IProject } from "@src/api/modules/projects/project_types.ts";
import projects_seed from "@src/api/modules/projects/projects.json" assert { type: "json" };

type ProjectCreateInput = {
	id?: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
};

type ProjectPatchInput = Partial<Omit<ProjectCreateInput, "id">>;

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const now = () => new Date().toISOString();

const projects_state: IProject[] = (projects_seed as Array<IProject>).map((project) => {
	const timestamp = now();
	return {
		...project,
		created_at: project.created_at ?? timestamp,
		updated_at: project.updated_at ?? timestamp,
		deleted_at: project.deleted_at ?? null,
	};
});

function getProjectIndex(project_id: string): number {
	return projects_state.findIndex((project) => project.id === project_id);
}

export function getAllProjects(): IProject[] {
	return projects_state.filter((project) => !project.deleted_at);
}

export function getProjectById(project_id: string): IProject | null {
	return projects_state.find((project) => project.id === project_id && !project.deleted_at) ?? null;
}

export function createProject(input: ProjectCreateInput): IProject {
	const timestamp = now();
	const generated_id = slugify(input.id?.trim() || input.name);
	const project_id = generated_id.length > 0 ? generated_id : `project-${Date.now()}`;

	const duplicate = projects_state.some((project) => project.id === project_id && !project.deleted_at);
	if (duplicate) {
		throw {
			code: 409,
			errorType: "conflict",
			message: "Project id already exists.",
		};
	}

	const project: IProject = {
		id: project_id,
		name: input.name,
		summary: input.summary,
		year: input.year,
		status: input.status,
		stack: input.stack,
		link: input.link,
		created_at: timestamp,
		updated_at: timestamp,
		deleted_at: null,
	};

	projects_state.push(project);
	return project;
}

export function updateProject(project_id: string, patch: ProjectPatchInput): IProject | null {
	const project_index = getProjectIndex(project_id);
	if (project_index < 0) {
		return null;
	}

	const current = projects_state[project_index];
	if (current.deleted_at) {
		return null;
	}

	const next_value: IProject = {
		...current,
		...patch,
		link: patch.link !== undefined ? patch.link : current.link,
		updated_at: now(),
	};

	projects_state[project_index] = next_value;
	return next_value;
}

export function softDeleteProject(project_id: string): IProject | null {
	const project_index = getProjectIndex(project_id);
	if (project_index < 0) {
		return null;
	}

	const current = projects_state[project_index];
	if (current.deleted_at) {
		return null;
	}

	const deleted_project: IProject = {
		...current,
		deleted_at: now(),
		updated_at: now(),
	};

	projects_state[project_index] = deleted_project;
	return deleted_project;
}
