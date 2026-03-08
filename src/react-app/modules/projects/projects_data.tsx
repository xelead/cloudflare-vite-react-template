import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import type { ProjectsResponse } from "@src/react-app/modules/projects/projects_types.ts";

type ProjectsDataContextValue = {
	data: ProjectsResponse;
	setData: Dispatch<SetStateAction<ProjectsResponse>>;
};

const ProjectsDataContext = createContext<ProjectsDataContextValue | null>(
	null,
);

export function ProjectsDataProvider({
	data,
	children,
}: {
	data: ProjectsResponse;
	children: ReactNode;
}) {
	const [state, setState] = useState<ProjectsResponse>(data);

	return (
		<ProjectsDataContext.Provider value={{ data: state, setData: setState }}>
			{children}
		</ProjectsDataContext.Provider>
	);
}

export function useProjectsData() {
	return (
		useContext(ProjectsDataContext) ?? {
			data: { projects: [] },
			setData: () => undefined,
		}
	);
}
