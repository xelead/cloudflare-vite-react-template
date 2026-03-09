import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	getUserFriendlyErrorMessage,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import { use_project_entity_meta } from "@src/ui/modules/projects/use_project_entity_meta.ts";
import type {
	Project,
	ProjectApiResponse,
	ProjectsApiResponse,
} from "@src/ui/modules/projects/projects_types.ts";

function render_field_value(value: unknown): string {
	if (Array.isArray(value)) {
		return value.map((item) => String(item)).join(" · ");
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

function ProjectsPage() {
	const { data, setData } = useProjectsData();
	const { projects } = data;
	const { meta, list_fields, is_loading: is_meta_loading } = use_project_entity_meta();
	const [hasFetched, setHasFetched] = useState(false);
	const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const title_field_name = meta?.entityInfo.displayNameFieldName ?? "name";

	useEffect(() => {
		if (projects.length > 0 || hasFetched) {
			return;
		}

		setHasFetched(true);
		fetch("/api/projects")
			.then(async (res) => {
				return readApiPayload<ProjectsApiResponse>(res, "Failed to load projects.");
			})
			.then((payload) => {
				if (Array.isArray(payload.data?.list)) {
					setData({ projects: payload.data.list });
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
					<h1>{meta?.entityInfo.entityTitle ?? "Projects"}</h1>
					<p>Shipped work tracked from the API-powered JSON endpoint.</p>
				</div>
			</section>

			{is_meta_loading && (
				<div className="status-card">Loading project field metadata...</div>
			)}

			{!is_meta_loading && projects.length === 0 && (
				<div className="status-card">No projects available yet.</div>
			)}

			{projects.length > 0 && (
				<section className="project-grid">
					{projects.map((project) => (
						<article key={project.id} className="project-card">
							<div className="project-header">
								<h2>{render_field_value(project[title_field_name as keyof Project])}</h2>
							</div>
							{list_fields.map((field) => (
								<div className="project-meta" key={`${project.id}-${field.name}`}>
									<span>{field.label}</span>
									<span>{render_field_value(project[field.name as keyof Project])}</span>
								</div>
							))}
							<div className="project-meta">
								<Link className="project-link" to={`/projects/${project.id}`}>
									View details
								</Link>
								<Link className="project-link" to={`/projects/${project.id}/edit`}>
									Edit
								</Link>
								<button
									className="project-link button-link danger-link"
									type="button"
									onClick={() => {
										setDeleteCandidate(project);
										setErrorMessage(null);
									}}
								>
									Delete
								</button>
								{typeof project.link === "string" && project.link.length > 0 && (
									<a className="project-link" href={project.link}>
										View project
									</a>
								)}
							</div>
						</article>
					))}
				</section>
			)}

			{deleteCandidate && (
				<dialog className="confirm-dialog" open>
					<h2>Delete Project?</h2>
					<p>
						Are you sure you want to delete{" "}
						<strong>
							{render_field_value(deleteCandidate[title_field_name as keyof Project])}
						</strong>
						?
					</p>
					{errorMessage && <p className="status-card status-error">{errorMessage}</p>}
					<div className="dialog-actions">
						<button
							className="danger-button"
							type="button"
							disabled={isDeleting}
							onClick={() => {
								setIsDeleting(true);
								setErrorMessage(null);
								fetch(`/api/projects/${encodeURIComponent(deleteCandidate.id)}`, {
									method: "DELETE",
								})
									.then(async (res) => {
										await readApiPayload<ProjectApiResponse>(
											res,
											"Failed to delete project.",
										);
									})
									.then(() => {
										setData((current) => ({
											projects: current.projects.filter((item) => item.id !== deleteCandidate.id),
										}));
										setDeleteCandidate(null);
									})
									.catch((error: unknown) => {
										setErrorMessage(
											getUserFriendlyErrorMessage(error, "Failed to delete project."),
										);
									})
									.finally(() => {
										setIsDeleting(false);
									});
							}}
						>
							{isDeleting ? "Deleting..." : "Confirm Delete"}
						</button>
						<button
							type="button"
							onClick={() => {
								setDeleteCandidate(null);
								setErrorMessage(null);
							}}
						>
							Cancel
						</button>
					</div>
				</dialog>
			)}
		</div>
	);
}

export default ProjectsPage;
