import type { Person } from "@src/ui/modules/people/people_types.ts";
import type { Project } from "@src/ui/modules/projects/projects_types.ts";

export type AppInitialData = {
	projects: Project[];
	people: Person[];
};
