import { useEffect, useState } from "react";

type Project = {
	id: string;
	name: string;
	summary: string;
	year: number;
	status: string;
	stack: string[];
	link?: string;
};

type ProjectsResponse = {
	projects: Project[];
};

function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
		"idle",
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setStatus("loading");
		setError(null);

		fetch("/api/projects")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Request failed: ${response.status}`);
				}
				return response.json() as Promise<ProjectsResponse>;
			})
			.then((data) => {
				if (cancelled) return;
				setProjects(data.projects);
				setStatus("success");
			})
			.catch((fetchError: Error) => {
				if (cancelled) return;
				setError(fetchError.message);
				setStatus("error");
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="page">
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>Projects</h1>
					<p>Shipped work tracked from the Worker-powered JSON API.</p>
				</div>
			</section>

			{status === "loading" && (
				<div className="status-card">Loading projects...</div>
			)}
			{status === "error" && (
				<div className="status-card status-error">
					Could not load projects. {error}
				</div>
			)}
			{status === "success" && projects.length === 0 && (
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

export default Projects;
