import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { IPerson } from "@src/api/modules/people/people_types.ts";
import { create_entity_data_context } from "@src/ui/common/entity_data_context.tsx";
import type { Project } from "@src/ui/modules/projects/projects_types.ts";

export type PeopleResponse = {
	people: IPerson[];
};

export type ProjectsResponse = {
	projects: Project[];
};

type PeopleDataContextValue = {
	data: PeopleResponse;
	setData: Dispatch<SetStateAction<PeopleResponse>>;
};

type ProjectsDataContextValue = {
	data: ProjectsResponse;
	setData: Dispatch<SetStateAction<ProjectsResponse>>;
};

const people_data = create_entity_data_context<PeopleResponse>("People");
const projects_data = create_entity_data_context<ProjectsResponse>("Projects");

export function PeopleDataProvider({
	data,
	children,
}: {
	data: PeopleResponse;
	children: ReactNode;
}) {
	return (
		<people_data.EntityDataProvider initial_data={data}>
			{children}
		</people_data.EntityDataProvider>
	);
}

export function ProjectsDataProvider({
	data,
	children,
}: {
	data: ProjectsResponse;
	children: ReactNode;
}) {
	return (
		<projects_data.EntityDataProvider initial_data={data}>
			{children}
		</projects_data.EntityDataProvider>
	);
}

export function usePeopleData(): PeopleDataContextValue {
	return people_data.use_entity_data({ people: [] });
}

export function useProjectsData(): ProjectsDataContextValue {
	return projects_data.use_entity_data({ projects: [] });
}
