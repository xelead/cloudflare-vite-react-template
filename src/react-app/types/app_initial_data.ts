import type { Person } from "@src/react-app/modules/people/people_types.ts";
import type { Project } from "@src/react-app/modules/projects/projects_types.ts";

export type AppInitialData = {
	projects: Project[];
	people: Person[];
};
