import { EntityListPage } from "@src/ui/common/index.ts";
import { usePeopleData } from "@src/ui/modules/people/people_data.tsx";
import type { IPerson } from "@src/ui/modules/people/people_types.ts";

function PeoplePage() {
	const { data, setData } = usePeopleData();

	return (
		<EntityListPage<IPerson>
			entity_code="people"
			entity_type_name="Person"
			context_data={{
				list: data.people,
				setData: (update: { list: IPerson[] } | ((prev: { list: IPerson[] }) => { list: IPerson[] })) => {
					const new_data = typeof update === "function"
						? update({ list: data.people })
						: update;
					setData({ people: new_data.list });
				},
			}}
			description="Team members served from the API-powered JSON endpoint."
		/>
	);
}

export default PeoplePage;