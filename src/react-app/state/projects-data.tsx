import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { ProjectsResponse } from "../types/projects";

const ProjectsDataContext = createContext<ProjectsResponse | null>(null);

export function ProjectsDataProvider({
	data,
	children,
}: {
	data: ProjectsResponse;
	children: ReactNode;
}) {
	return (
		<ProjectsDataContext.Provider value={data}>
			{children}
		</ProjectsDataContext.Provider>
	);
}

export function useProjectsData() {
	return useContext(ProjectsDataContext) ?? { projects: [] };
}
