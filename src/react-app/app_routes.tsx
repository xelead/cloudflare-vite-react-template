import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProjectsPage from "./modules/projects/index.tsx";

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/projects" element={<ProjectsPage />} />
		</Routes>
	);
}
