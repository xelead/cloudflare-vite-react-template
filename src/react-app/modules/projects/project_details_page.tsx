import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProjectsData } from "@src/react-app/modules/projects/projects_data.tsx";
import type { Project, ProjectsResponse } from "@src/react-app/modules/projects/projects_types.ts";

function ProjectDetailsPage() {
	const { project_id } = useParams();
	const { data, setData } = useProjectsData();
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		if (!project_id || data.projects.length > 0 || hasFetched) {
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
				// Keep not-found fallback on fetch failure.
			});
	}, [data.projects.length, hasFetched, project_id, setData]);

	const project = useMemo<Project | undefined>(() => {
		if (!project_id) {
			return undefined;
		}

		return data.projects.find((item) => item.id === project_id);
	}, [data.projects, project_id]);

	if (!project) {
		return (
			<div className="page">
				<title>Project Not Found | Cloudflare Vite React</title>
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Project Not Found</h1>
						<p>The requested project could not be found.</p>
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
