import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@src/react-app/index.css";
import App from "@src/react-app/App";
import { ProjectsDataProvider } from "@src/react-app/modules/projects/projects_data.tsx";
import type { ProjectsResponse } from "@src/react-app/modules/projects/projects_types.tsx";

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
