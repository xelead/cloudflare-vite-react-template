import { useProjectsData } from "../state/projects-data.tsx";

function Projects() {
	const { projects } = useProjectsData();

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
					<p>Shipped work tracked from the Worker-powered JSON API.</p>
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
