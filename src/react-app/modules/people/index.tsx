import { useEffect, useState } from "react";
import { usePeopleData } from "@src/react-app/modules/people/people_data.tsx";
import type { PeopleResponse } from "@src/react-app/modules/people/people_types.ts";

function PeoplePage() {
	const { data, setData } = usePeopleData();
	const { people } = data;
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		if (people.length > 0 || hasFetched) {
			return;
		}

		setHasFetched(true);
		fetch("/api/people")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load people.");
				}
				return res.json() as Promise<PeopleResponse>;
			})
			.then((payload) => {
				if (Array.isArray(payload.people)) {
					setData({ people: payload.people });
				}
			})
			.catch(() => {
				// Fall back to the existing empty state.
			});
	}, [hasFetched, people.length, setData]);

	return (
		<div className="page">
			<title>People | Cloudflare Vite React</title>
			<meta
				name="description"
				content="Explore people data loaded from dynamic Worker routes."
			/>
			<meta property="og:title" content="People | Cloudflare Vite React" />
			<meta
				property="og:description"
				content="Explore people data loaded from dynamic Worker routes."
			/>
			<meta property="og:type" content="website" />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>People</h1>
					<p>Team members served from the Worker-powered JSON API.</p>
				</div>
			</section>

			{people.length === 0 && (
				<div className="status-card">No people available yet.</div>
			)}

			{people.length > 0 && (
				<section className="project-grid">
					{people.map((person) => (
						<article key={person.id} className="project-card">
							<div className="project-header">
								<div>
									<h2>{person.name}</h2>
									<p>{person.role}</p>
								</div>
								<span className="pill">{person.status}</span>
							</div>
							<div className="project-meta">
								<span>{person.location}</span>
								<span>{person.skills.join(" · ")}</span>
							</div>
						</article>
					))}
				</section>
			)}
		</div>
	);
}

export default PeoplePage;
