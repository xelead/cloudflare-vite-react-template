import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import type { PeopleResponse } from "@src/react-app/modules/people/people_types.ts";

type PeopleDataContextValue = {
	data: PeopleResponse;
	setData: Dispatch<SetStateAction<PeopleResponse>>;
};

const PeopleDataContext = createContext<PeopleDataContextValue | null>(null);

export function PeopleDataProvider({
	data,
	children,
}: {
	data: PeopleResponse;
	children: ReactNode;
}) {
	const [state, setState] = useState<PeopleResponse>(data);

	return (
		<PeopleDataContext.Provider value={{ data: state, setData: setState }}>
			{children}
		</PeopleDataContext.Provider>
	);
}

export function usePeopleData() {
	return (
		useContext(PeopleDataContext) ?? {
			data: { people: [] },
			setData: () => undefined,
		}
	);
}
