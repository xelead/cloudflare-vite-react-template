import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import {
	getUserFriendlyErrorMessage,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import { use_project_entity_meta } from "@src/ui/modules/projects/use_project_entity_meta.ts";
import type { Project, ProjectApiResponse } from "@src/ui/modules/projects/projects_types.ts";

function render_field_value(value: unknown): string {
	if (Array.isArray(value)) {
		return value.map((item) => String(item)).join(" · ");
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

function ProjectDetailsPage() {
	const { project_id } = useParams();
	const { data } = useProjectsData();
	const { meta, list_fields } = use_project_entity_meta();
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

		if (initialProject) {
			setProject(initialProject);
			setErrorMessage(null);
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);
		fetch(`/api/projects/${encodeURIComponent(project_id)}`)
			.then(async (res) => {
				return readApiPayload<ProjectApiResponse>(res, "Failed to load project.");
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
				setErrorMessage(getUserFriendlyErrorMessage(error, "Failed to load project."));
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [initialProject, project_id]);

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

	const title_field_name = meta?.entityInfo.displayNameFieldName ?? "name";
	const project_title = render_field_value(project[title_field_name as keyof Project]);

	return (
		<div className="page">
			<title>{`${project_title} | Cloudflare Vite React`}</title>
			<meta name="description" content={project_title} />
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{project_title}</h1>
					<p>Dynamic details rendered from project entity metadata.</p>
				</div>
			</section>
			<article className="project-card">
				<div className="project-header">
					<div>
						<h2>Project Overview</h2>
						<p>Field values mapped from `entityInfo.fields`.</p>
					</div>
				</div>
				{list_fields.map((field) => (
					<div className="project-meta" key={field.name}>
						<span>{field.label}</span>
						<span>{render_field_value(project[field.name as keyof Project])}</span>
					</div>
				))}
				<div className="project-meta">
					<Link className="project-link" to="/projects">
						Back to projects
					</Link>
					<Link className="project-link" to={`/projects/${project.id}/edit`}>
						Edit project
					</Link>
					{typeof project.link === "string" && project.link.length > 0 && (
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
