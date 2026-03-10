import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	getErrorDebugDetails,
	getUserFriendlyErrorMessage,
	readApiPayload,
} from "@src/common/crud/api_response_utils.ts";
import { useProjectsData } from "@src/ui/modules/projects/projects_data.tsx";
import { use_project_entity_meta } from "@src/ui/modules/projects/use_project_entity_meta.ts";
import type {
	Project,
	ProjectApiResponse,
	ProjectFieldMeta,
	ProjectPatchPayload,
} from "@src/ui/modules/projects/projects_types.ts";

type FormState = Record<string, string>;
type ParsedPatch = {
	patch?: ProjectPatchPayload;
	error?: string;
};

function are_string_arrays_equal(left: string[], right: string[]): boolean {
	if (left.length !== right.length) {
		return false;
	}

	for (let index = 0; index < left.length; index += 1) {
		if (left[index] !== right[index]) {
			return false;
		}
	}

	return true;
}

function to_input_value(value: unknown, field: ProjectFieldMeta): string {
	if (value === undefined || value === null) {
		return "";
	}

	if (field.jsonDataType === "array" && Array.isArray(value)) {
		return value.map((item) => String(item)).join(", ");
	}

	return String(value);
}

function build_form_state(project: Project, form_fields: ProjectFieldMeta[]): FormState {
	const next_form_state: FormState = {};

	for (const field of form_fields) {
		next_form_state[field.name] = to_input_value(project[field.name as keyof Project], field);
	}

	return next_form_state;
}

function parse_field_input(value: string, field: ProjectFieldMeta): { value?: unknown; error?: string } {
	if (field.jsonDataType === "number") {
		const parsed_number = Number(value);
		if (!Number.isFinite(parsed_number)) {
			return { error: `${field.label} must be a valid number.` };
		}

		if (
			(field.storageDataType === "int" || field.storageDataType === "int64") &&
			!Number.isInteger(parsed_number)
		) {
			return { error: `${field.label} must be an integer.` };
		}

		return { value: parsed_number };
	}

	if (field.jsonDataType === "array") {
		return {
			value: value
				.split(",")
				.map((item) => item.trim())
				.filter((item) => item.length > 0),
		};
	}

	if (field.jsonDataType === "boolean") {
		return { value: value === "true" || value === "1" };
	}

	return { value: value.trim() };
}

function get_changed_patch_payload(
	project: Project,
	form_state: FormState,
	form_fields: ProjectFieldMeta[],
): ParsedPatch {
	const patch: Record<string, unknown> = {};

	for (const field of form_fields) {
		const raw_value = form_state[field.name] ?? "";
		const parsed = parse_field_input(raw_value, field);
		if (parsed.error) {
			return { error: parsed.error };
		}

		if (field.isRequired) {
			if (field.jsonDataType === "array") {
				if (!Array.isArray(parsed.value) || parsed.value.length === 0) {
					return { error: `${field.label} is required.` };
				}
			} else if (String(parsed.value ?? "").trim() === "") {
				return { error: `${field.label} is required.` };
			}
		}

		const current_value = project[field.name as keyof Project];
		if (field.jsonDataType === "array") {
			const next_array = Array.isArray(parsed.value) ? parsed.value.map((item) => String(item)) : [];
			const current_array = Array.isArray(current_value)
				? current_value.map((item) => String(item))
				: [];
			if (!are_string_arrays_equal(next_array, current_array)) {
				patch[field.name] = next_array;
			}
			continue;
		}

		if (field.name === "link") {
			const current_link = String(current_value ?? "").trim();
			const next_link = String(parsed.value ?? "").trim();
			if (next_link !== current_link) {
				patch.link = next_link.length > 0 ? next_link : "";
			}
			continue;
		}

		if (parsed.value !== current_value) {
			patch[field.name] = parsed.value;
		}
	}

	return { patch: patch as ProjectPatchPayload };
}

function ProjectEditPage() {
	const { project_id } = useParams();
	const navigate = useNavigate();
	const { data, setData } = useProjectsData();
	const { meta, form_fields, is_loading: is_meta_loading, error_message: meta_error } =
		use_project_entity_meta();
	const initial_project = useMemo<Project | null>(() => {
		if (!project_id) {
			return null;
		}

		return data.projects.find((item) => item.id === project_id) ?? null;
	}, [data.projects, project_id]);
	const [project, setProject] = useState<Project | null>(initial_project);
	const [form_state, setFormState] = useState<FormState>({});
	const [error_message, setErrorMessage] = useState<string | null>(null);
	const [error_debug_details, setErrorDebugDetails] = useState<Record<string, unknown> | null>(null);
	const [is_saving, setIsSaving] = useState(false);
	const [is_loading, setIsLoading] = useState(!initial_project);

	useEffect(() => {
		if (!initial_project || form_fields.length === 0) {
			return;
		}

		setFormState(build_form_state(initial_project, form_fields));
	}, [form_fields, initial_project]);

	useEffect(() => {
		if (!project_id) {
			setProject(null);
			setErrorMessage("Project id is missing.");
			setErrorDebugDetails(null);
			setIsLoading(false);
			return;
		}

		if (initial_project) {
			setProject(initial_project);
			if (form_fields.length > 0) {
				setFormState(build_form_state(initial_project, form_fields));
			}
			setErrorMessage(null);
			setErrorDebugDetails(null);
			setIsLoading(false);
			return;
		}

		let is_cancelled = false;
		setIsLoading(true);

		fetch(`/api/projects/${encodeURIComponent(project_id)}`)
			.then(async (res) => {
				const payload = await readApiPayload<ProjectApiResponse>(res, "Failed to load project.");
				if (!payload.data) {
					throw new Error(payload.message ?? "Project not found.");
				}

				return payload.data;
			})
			.then((loaded_project) => {
				if (is_cancelled) {
					return;
				}

				setProject(loaded_project);
				if (form_fields.length > 0) {
					setFormState(build_form_state(loaded_project, form_fields));
				}
				setErrorMessage(null);
				setErrorDebugDetails(null);
			})
			.catch((error: unknown) => {
				if (is_cancelled) {
					return;
				}

				setProject(null);
				setErrorMessage(getUserFriendlyErrorMessage(error, "Failed to load project."));
				setErrorDebugDetails(getErrorDebugDetails(error) ?? null);
			})
			.finally(() => {
				if (!is_cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			is_cancelled = true;
		};
	}, [form_fields, initial_project, project_id]);

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

	if (is_meta_loading) {
		return (
			<div className="page">
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit Project</h1>
						<p>Loading project field metadata...</p>
					</div>
				</section>
			</div>
		);
	}

	if (meta_error) {
		return (
			<div className="page">
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit Project</h1>
						<p>{meta_error}</p>
					</div>
				</section>
			</div>
		);
	}

	if (is_loading && !project) {
		return (
			<div className="page">
				<section className="hero hero-slim">
					<div className="hero-copy">
						<h1>Edit Project</h1>
						<p>Loading project...</p>
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
			<title>{`Edit ${project.name} | Cloudflare Vite React`}</title>
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>{`Edit ${meta?.entityInfo.entityTitle ?? "Project"}`}</h1>
					<p>Update project metadata and publish changes.</p>
				</div>
			</section>

			<form
				className="project-form"
				onSubmit={(event) => {
					event.preventDefault();
					setIsSaving(true);
					setErrorMessage(null);
					setErrorDebugDetails(null);
					const changed_patch = get_changed_patch_payload(project, form_state, form_fields);

					if (changed_patch.error) {
						setIsSaving(false);
						setErrorMessage(changed_patch.error);
						return;
					}

					const patch_payload = changed_patch.patch ?? {};
					if (Object.keys(patch_payload).length === 0) {
						setIsSaving(false);
						setErrorMessage("No changes to save.");
						return;
					}

					fetch(`/api/projects/${encodeURIComponent(project_id)}`, {
						method: "PATCH",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify(patch_payload),
					})
						.then(async (res) => {
							const payload = await readApiPayload<ProjectApiResponse>(
								res,
								"Failed to update project.",
							);
							if (!payload.data) {
								throw new Error(payload.message ?? "Failed to update project.");
							}
							return payload.data;
						})
						.then((updated_project) => {
							setData((current) => ({
								projects: current.projects.some((item) => item.id === updated_project.id)
									? current.projects.map((item) =>
											item.id === updated_project.id ? updated_project : item,
										)
									: [...current.projects, updated_project],
							}));
							navigate(`/projects/${updated_project.id}`);
						})
						.catch((error: unknown) => {
							setErrorMessage(getUserFriendlyErrorMessage(error, "Failed to update project."));
							setErrorDebugDetails(getErrorDebugDetails(error) ?? null);
						})
						.finally(() => {
							setIsSaving(false);
						});
				}}
			>
				{form_fields.map((field) => {
					const input_value = form_state[field.name] ?? "";
					const input_type = field.jsonDataType === "number" ? "number" : "text";
					const is_textarea = field.jsonDataType === "string" && field.formFieldProps.isFullWidth;

					return (
						<label className="field" key={field.name}>
							<span>{field.label}</span>
							{is_textarea ? (
								<textarea
									required={field.isRequired}
									value={input_value}
									onChange={(event) => {
										const next_value = (event.currentTarget as unknown as { value: string }).value;
										setFormState((current) => ({
											...current,
											[field.name]: next_value,
										}));
									}}
								/>
							) : (
								<input
									required={field.isRequired}
									type={input_type}
									value={input_value}
									onChange={(event) => {
										const next_value = (event.currentTarget as unknown as { value: string }).value;
										setFormState((current) => ({
											...current,
											[field.name]: next_value,
										}));
									}}
								/>
							)}
						</label>
					);
				})}

				{error_message && (
					<div className="status-card status-error">
						<p>{error_message}</p>
						{error_debug_details && (
							<details className="error-details">
								<summary>Debug Details</summary>
								<pre>{JSON.stringify(error_debug_details, null, 2)}</pre>
							</details>
						)}
					</div>
				)}

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
