import { EntityViewPage } from "@src/ui/common/index.ts";
import { usePeopleData } from "@src/ui/modules/people/people_data.tsx";

function PersonDetailsPage() {
	const { data } = usePeopleData();

	return (
		<EntityViewPage
			entity_code="people"
			entity_type_name="Person"
			context_data={{ list: data.people as unknown as Record<string, unknown>[] }}
		/>
	);
}

export default PersonDetailsPage;