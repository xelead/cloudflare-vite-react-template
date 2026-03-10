import { EntityEditPage } from "@src/ui/common/index.ts";
import { useProjectsData } from "@src/ui/common/entities_data.tsx";
import type { Project } from "@src/ui/modules/projects/projects_types.ts";

function ProjectEditPage() {
	const { data, setData } = useProjectsData();

	return (
		<EntityEditPage
			entity_code="projects"
			entity_type_name="Project"
			context_data={{ list: data.projects as unknown as Record<string, unknown>[] }}
			on_updated={(updated_project) => {
				setData((current) => ({
					projects: current.projects.some((item) => item.id === (updated_project as Project).id)
						? current.projects.map((item) =>
								item.id === (updated_project as Project).id ? (updated_project as Project) : item,
							)
						: [...current.projects, updated_project as Project],
				}));
			}}
		/>
	);
}

export default ProjectEditPage;
