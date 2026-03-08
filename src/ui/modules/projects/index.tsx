import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import type { ProjectsResponse } from "@src/ui/modules/projects/projects_types.ts";

function ProjectsPage() {
	const { data, setData } = useProjectsData();
	const { projects } = data;
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		if (projects.length > 0 || hasFetched) {
			return;
		}

		setHasFetched(true);
		fetch("/api/projects")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load projects.");
				}
				return res.json() as Promise<ProjectsResponse>;
			})
			.then((payload) => {
				if (Array.isArray(payload.projects)) {
					setData({ projects: payload.projects });
				}
			})
			.catch(() => {
				// Fall back to the existing empty state.
			});
	}, [hasFetched, projects.length, setData]);

	return (
		<div className="page">
			<title>Projects | Cloudflare Vite React</title>
			<meta
				name="description"
				content="Explore the latest projects shipped with the Cloudflare Vite React template."
			/>
			<meta property="og:title" content="Projects | Cloudflare Vite React" />
			<meta
				property="og:description"
				content="Explore the latest projects shipped with the Cloudflare Vite React template."
			/>
			<meta property="og:type" content="website" />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>Projects</h1>
					<p>Shipped work tracked from the API-powered JSON endpoint.</p>
				</div>
			</section>

			{projects.length === 0 && (
				<div className="status-card">No projects available yet.</div>
			)}

			{projects.length > 0 && (
				<section className="project-grid">
					{projects.map((project) => (
						<article key={project.id} className="project-card">
							<div className="project-header">
								<div>
									<h2>{project.name}</h2>
									<p>{project.summary}</p>
								</div>
								<span className="pill">{project.status}</span>
							</div>
							<div className="project-meta">
								<span>{project.year}</span>
								<span>{project.stack.join(" · ")}</span>
							</div>
							<Link className="project-link" to={`/projects/${project.id}`}>
								View details
							</Link>
							{project.link && (
								<a className="project-link" href={project.link}>
									View project
								</a>
							)}
						</article>
					))}
				</section>
			)}
		</div>
	);
}

export default ProjectsPage;
