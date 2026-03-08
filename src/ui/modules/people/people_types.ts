export type Person = {
	id: string;
	name: string;
	role: string;
	location: string;
	status: string;
	skills: string[];
};

export type PeopleResponse = {
	people: Person[];
};
