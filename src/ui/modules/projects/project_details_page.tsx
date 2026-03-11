import { EntityViewPage } from "@src/ui/common/index.ts";
import { useProjectsData } from "@src/ui/common/entities_data.tsx";

function ProjectDetailsPage() {
	const { data } = useProjectsData();

	return (
		<EntityViewPage
			entity_code="projects"
			entity_type_name="Project"
			external_link_field="link"
			context_data={{ list: data.projects as unknown as Record<string, unknown>[] }}
		/>
	);
}

export default ProjectDetailsPage;
