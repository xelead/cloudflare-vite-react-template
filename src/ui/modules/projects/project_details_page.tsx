import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import type { Project, ProjectApiResponse } from "@src/ui/modules/projects/projects_types.ts";

function ProjectDetailsPage() {
	const { project_id } = useParams();
	const { data } = useProjectsData();
	const initialProject = useMemo<Project | null>(() => {
		if (!project_id) {
			return null;
		}

		return data.projects.find((item) => item.id === project_id) ?? null;
	}, [data.projects, project_id]);
	const [project, setProject] = useState<Project | null>(initialProject);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		setProject(initialProject);
	}, [initialProject]);

	useEffect(() => {
		if (!project_id) {
			setProject(null);
			setErrorMessage("Project id is missing.");
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);
		fetch(`/api/projects/${encodeURIComponent(project_id)}`)
			.then(async (res) => {
				const payload = (await res.json()) as ProjectApiResponse;
				if (!res.ok || payload.hasError) {
					throw new Error(payload.message ?? "Failed to load project.");
				}
				return payload;
			})
			.then((payload) => {
				if (payload.data) {
					setProject(payload.data);
					return;
				}

				setProject(null);
				setErrorMessage("Project not found.");
			})
			.catch((error: unknown) => {
				setProject(null);
				setErrorMessage(error instanceof Error ? error.message : "Failed to load project.");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [project_id]);

	if (isLoading && !project) {
		return (
			<div className="page">
				<title>Loading Project | Cloudflare Vite React</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Loading Project</h1>
						<p>Fetching project details from API.</p>
					</div>
				</section>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="page">
				<title>Project Not Found | Cloudflare Vite React</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Project Not Found</h1>
						<p>{errorMessage ?? "The requested project could not be found."}</p>
					</div>
				</section>
				<div className="status-card">
					<Link className="project-link" to="/projects">
						Back to projects
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="page">
			<title>{project.name} | Cloudflare Vite React</title>
			<meta name="description" content={project.summary} />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{project.name}</h1>
					<p>{project.summary}</p>
				</div>
			</section>
			<article className="project-card">
				<div className="project-header">
					<div>
						<h2>Project Overview</h2>
						<p>Status and stack details from API-backed data.</p>
					</div>
					<span className="pill">{project.status}</span>
				</div>
				<div className="project-meta">
					<span>{project.year}</span>
					<span>{project.stack.join(" · ")}</span>
				</div>
				<div className="project-meta">
					<Link className="project-link" to="/projects">
						Back to projects
					</Link>
					{project.link && (
						<a className="project-link" href={project.link}>
							Visit project
						</a>
					)}
				</div>
			</article>
		</div>
	);
}

export default ProjectDetailsPage;
