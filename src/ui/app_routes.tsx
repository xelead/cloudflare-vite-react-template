import { Route, Routes } from "react-router-dom";
import Home from "@src/ui/pages/home";
import PeoplePage from "@src/ui/modules/people/index.tsx";
import ProjectsPage from "@src/ui/modules/projects/index.tsx";
import ProjectDetailsPage from "@src/ui/modules/projects/project_details_page.tsx";
import ProjectEditPage from "@src/ui/modules/projects/project_edit_page.tsx";

const app_routes = [
	{ path: "/", element: <Home /> },
	{ path: "/projects", element: <ProjectsPage /> },
	{ path: "/projects/:project_id", element: <ProjectDetailsPage /> },
	{ path: "/projects/:project_id/edit", element: <ProjectEditPage /> },
	{ path: "/people", element: <PeoplePage /> },
];

export default function AppRoutes() {
	return (
		<Routes>
			{app_routes.map((app_route) => (
				<Route
					key={app_route.path}
					path={app_route.path}
					element={app_route.element}
				/>
			))}
		</Routes>
	);
}
