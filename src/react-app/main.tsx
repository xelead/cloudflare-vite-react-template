import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@src/react-app/index.css";
import App from "@src/react-app/App";
import { PeopleDataProvider } from "@src/react-app/modules/people/people_data.tsx";
import { ProjectsDataProvider } from "@src/react-app/modules/projects/projects_data.tsx";
import type { AppInitialData } from "@src/react-app/types/app_initial_data.ts";

declare global {
	interface Window {
		__INITIAL_DATA__?: AppInitialData;
	}
}

const initialData = window.__INITIAL_DATA__ ?? { projects: [], people: [] };

const app = (
	<StrictMode>
		<ProjectsDataProvider data={{ projects: initialData.projects }}>
			<PeopleDataProvider data={{ people: initialData.people }}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</PeopleDataProvider>
		</ProjectsDataProvider>
	</StrictMode>
);

const container = document.getElementById("root");

if (container?.hasChildNodes()) {
	hydrateRoot(container, app);
} else if (container) {
	createRoot(container).render(app);
}
