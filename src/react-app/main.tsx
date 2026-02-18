import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ProjectsDataProvider } from "./state/projects-data";
import type { ProjectsResponse } from "./types/projects";

declare global {
	interface Window {
		__INITIAL_DATA__?: ProjectsResponse;
	}
}

const initialData = window.__INITIAL_DATA__ ?? { projects: [] };

const app = (
	<StrictMode>
		<ProjectsDataProvider data={initialData}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ProjectsDataProvider>
	</StrictMode>
);

const container = document.getElementById("root");

if (container?.hasChildNodes()) {
	hydrateRoot(container, app);
} else if (container) {
	createRoot(container).render(app);
}
