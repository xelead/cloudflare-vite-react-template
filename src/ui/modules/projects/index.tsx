import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import type {
	Project,
	ProjectApiResponse,
	ProjectsApiResponse,
} from "@src/ui/modules/projects/projects_types.ts";

function ProjectsPage() {
	const { data, setData } = useProjectsData();
	const { projects } = data;
	const [hasFetched, setHasFetched] = useState(false);
	const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (projects.length > 0 || hasFetched) {
			return;
		}

		setHasFetched(true);
		fetch("/api/projects")
			.then(async (res) => {
				const payload = (await res.json()) as ProjectsApiResponse;
				if (!res.ok || payload.hasError) {
					throw new Error(payload.message ?? "Failed to load projects.");
				}
				return payload;
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
								{project.link && (
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
						Are you sure you want to delete <strong>{deleteCandidate.name}</strong>?
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
										const payload = (await res.json()) as ProjectApiResponse;
										if (!res.ok || payload.hasError) {
											throw new Error(payload.message ?? "Failed to delete project.");
										}
									})
									.then(() => {
										setData((current) => ({
											projects: current.projects.filter((item) => item.id !== deleteCandidate.id),
										}));
										setDeleteCandidate(null);
									})
									.catch((error: unknown) => {
										setErrorMessage(
											error instanceof Error ? error.message : "Failed to delete project.",
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
