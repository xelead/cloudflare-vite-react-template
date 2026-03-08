import { Route, Routes } from "react-router-dom";
import Home from "@src/react-app/pages/Home";
import PeoplePage from "@src/react-app/modules/people/index.tsx";
import ProjectsPage from "@src/react-app/modules/projects/index.tsx";
import ProjectDetailsPage from "@src/react-app/modules/projects/project_details_page.tsx";

const app_routes = [
	{ path: "/", element: <Home /> },
	{ path: "/projects", element: <ProjectsPage /> },
	{ path: "/projects/:project_id", element: <ProjectDetailsPage /> },
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
