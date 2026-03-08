import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import type {
	Project,
	ProjectApiResponse,
	ProjectPatchPayload,
} from "@src/ui/modules/projects/projects_types.ts";

type FormState = {
	name: string;
	summary: string;
	year: string;
	status: string;
	stack: string;
	link: string;
};

function toFormState(project: Project): FormState {
	return {
		name: project.name,
		summary: project.summary,
		year: String(project.year),
		status: project.status,
		stack: project.stack.join(", "),
		link: project.link ?? "",
	};
}

function toPatchPayload(form_state: FormState): ProjectPatchPayload {
	return {
		name: form_state.name.trim(),
		summary: form_state.summary.trim(),
		year: Number(form_state.year),
		status: form_state.status.trim(),
		stack: form_state.stack
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0),
		link: form_state.link.trim() || undefined,
	};
}

function ProjectEditPage() {
	const { project_id } = useParams();
	const navigate = useNavigate();
	const { data, setData } = useProjectsData();
	const initial_project = useMemo<Project | null>(() => {
		if (!project_id) {
			return null;
		}

		return data.projects.find((item) => item.id === project_id) ?? null;
	}, [data.projects, project_id]);
	const [project, setProject] = useState<Project | null>(initial_project);
	const [form_state, setFormState] = useState<FormState>(
		initial_project
			? toFormState(initial_project)
			: {
					name: "",
					summary: "",
					year: "",
					status: "",
					stack: "",
					link: "",
				},
	);
	const [error_message, setErrorMessage] = useState<string | null>(null);
	const [is_saving, setIsSaving] = useState(false);

	useEffect(() => {
		if (initial_project) {
			setProject(initial_project);
			setFormState(toFormState(initial_project));
			return;
		}

		if (!project_id) {
			setProject(null);
			setErrorMessage("Project id is missing.");
			return;
		}

		fetch(`/api/projects/${encodeURIComponent(project_id)}`)
			.then(async (res) => {
				const payload = (await res.json()) as ProjectApiResponse;
				if (!res.ok || payload.hasError || !payload.data) {
					throw new Error(payload.message ?? "Failed to load project.");
				}
				return payload.data;
			})
			.then((loaded_project) => {
				setProject(loaded_project);
				setFormState(toFormState(loaded_project));
				setErrorMessage(null);
			})
			.catch((error: unknown) => {
				setErrorMessage(error instanceof Error ? error.message : "Failed to load project.");
			});
	}, [initial_project, project_id]);

	if (!project_id) {
		return (
			<div className="page">
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit Project</h1>
						<p>Project id is missing.</p>
					</div>
				</section>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="page">
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit Project</h1>
						<p>{error_message ?? "Project not found."}</p>
					</div>
				</section>
				<div className="status-card">
					<Link className="project-link" to={`/projects/${project_id}`}>
						Back to details
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="page">
			<title>Edit {project.name} | Cloudflare Vite React</title>
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>Edit Project</h1>
					<p>Update project metadata and publish changes.</p>
				</div>
			</section>

			<form
				className="project-form"
				onSubmit={(event) => {
					event.preventDefault();
					setIsSaving(true);
					setErrorMessage(null);
					fetch(`/api/projects/${encodeURIComponent(project_id)}`, {
						method: "PATCH",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify(toPatchPayload(form_state)),
					})
						.then(async (res) => {
							const payload = (await res.json()) as ProjectApiResponse;
							if (!res.ok || payload.hasError || !payload.data) {
								throw new Error(payload.message ?? "Failed to update project.");
							}

							return payload.data;
						})
						.then((updated_project) => {
							setData((current) => ({
								projects: current.projects.map((item) =>
									item.id === updated_project.id ? updated_project : item,
								),
							}));
							navigate(`/projects/${updated_project.id}`);
						})
						.catch((error: unknown) => {
							setErrorMessage(error instanceof Error ? error.message : "Failed to update project.");
						})
						.finally(() => {
							setIsSaving(false);
						});
				}}
			>
				{/*
					Worker type-check compiles this file without DOM libs.
					Use a structural cast for input values to keep shared type-check green.
				*/}
				<label className="field">
					<span>Name</span>
					<input
						required
						value={form_state.name}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								name: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>
				<label className="field">
					<span>Summary</span>
					<textarea
						required
						value={form_state.summary}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								summary: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>
				<label className="field">
					<span>Year</span>
					<input
						required
						type="number"
						value={form_state.year}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								year: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>
				<label className="field">
					<span>Status</span>
					<input
						required
						value={form_state.status}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								status: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>
				<label className="field">
					<span>Stack (comma separated)</span>
					<input
						required
						value={form_state.stack}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								stack: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>
				<label className="field">
					<span>Link</span>
					<input
						value={form_state.link}
						onChange={(event) =>
							setFormState((current) => ({
								...current,
								link: (event.currentTarget as unknown as { value: string }).value,
							}))
						}
					/>
				</label>

				{error_message && <p className="status-card status-error">{error_message}</p>}

				<div className="project-form-actions">
					<button disabled={is_saving} type="submit">
						{is_saving ? "Saving..." : "Save Changes"}
					</button>
					<Link className="project-link" to={`/projects/${project_id}`}>
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}

export default ProjectEditPage;
