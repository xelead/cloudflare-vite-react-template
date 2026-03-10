import { EntityEditPage } from "@src/ui/common/index.ts";
import { usePeopleData } from "@src/ui/common/entities_data.tsx";
import type { IPerson } from "@src/api/modules/people/people_types.ts";

function PersonEditPage() {
	const { data, setData } = usePeopleData();

	return (
		<EntityEditPage
			entity_code="people"
			entity_type_name="Person"
			context_data={{ list: data.people as unknown as Record<string, unknown>[] }}
			on_updated={(updated_person) => {
				const person = updated_person as unknown as IPerson;
				setData((current) => ({
					people: current.people.some((item) => item.id === person.id)
						? current.people.map((item) =>
								item.id === person.id ? person : item,
							)
						: [...current.people, person],
				}));
			}}
		/>
	);
}

export default PersonEditPage;
