import { EntityListPage } from "@src/ui/common/index.ts";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import type { Project } from "@src/ui/modules/projects/projects_types.ts";

function ProjectsPage() {
	const { data, setData } = useProjectsData();

	return (
		<EntityListPage<Project>
			entity_code="projects"
			entity_type_name="Project"
			context_data={{
				list: data.projects,
				setData: (update: { list: Project[] } | ((prev: { list: Project[] }) => { list: Project[] })) => {
					const new_data = typeof update === "function"
						? update({ list: data.projects })
						: update;
					setData({ projects: new_data.list });
				},
			}}
			external_link_field="link"
			description="Shipped work tracked from the API-powered JSON endpoint."
		/>
	);
}

export default ProjectsPage;