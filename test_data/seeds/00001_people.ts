import { populateCoreDb } from "../../tools/db/seed_utils";
import { IPerson } from "../../src/api/modules/people/people_types";

const COLLECTION_NAME = "people";

const rows: IPerson[] = [
	{
		id: "sarah-chen",
		name: "Sarah Chen",
		role: "Engineering Manager",
		location: "San Francisco, CA",
		status: "Active",
		skills: ["Leadership", "System Design", "TypeScript"],
	},
	{
		id: "marcus-johnson",
		name: "Marcus Johnson",
		role: "Senior Frontend Engineer",
		location: "New York, NY",
		status: "Active",
		skills: ["React", "Cloudflare", "CSS"],
	},
	{
		id: "elena-rodriguez",
		name: "Elena Rodriguez",
		role: "Backend Engineer",
		location: "Austin, TX",
		status: "Active",
		skills: ["Node.js", "PostgreSQL", "API Design"],
	},
	{
		id: "david-kim",
		name: "David Kim",
		role: "DevOps Engineer",
		location: "Seattle, WA",
		status: "Active",
		skills: ["Kubernetes", "AWS", "CI/CD"],
	},
	{
		id: "amanda-foster",
		name: "Amanda Foster",
		role: "Product Designer",
		location: "Portland, OR",
		status: "Active",
		skills: ["Figma", "User Research", "Prototyping"],
	},
];

async function up() {
	await populateCoreDb(rows, COLLECTION_NAME);
}

export default { up };
