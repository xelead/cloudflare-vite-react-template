export interface IPerson {
	id: string;
	name: string;
	role: string;
	location: string;
	status: string;
	skills: string[];
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
}