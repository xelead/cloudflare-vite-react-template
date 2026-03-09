import { NavLink } from "react-router-dom";
import "@src/ui/app.css";
import AppRoutes from "@src/ui/app_routes";
import {
	PublicConfigProvider,
	usePublicConfigData,
} from "@src/ui/modules/publicconfig/publicconfig_data.tsx";

function AppLayout() {
	const { data } = usePublicConfigData();
	const theme = data.NEXT_PUBLIC_THEME?.toLowerCase() === "dark" ? "dark" : "light";

	return (
		<div className="app" data-theme={theme}>
			<header className="site-header">
				<div className="brand">Cloudflare Vite React</div>
				<nav className="nav">
					<NavLink to="/" end>
						Home
					</NavLink>
					<NavLink to="/projects">Projects</NavLink>
					<NavLink to="/people">People</NavLink>
				</nav>
			</header>
			<main className="content">
				<AppRoutes />
			</main>
		</div>
	);
}

function App() {
	return (
		<PublicConfigProvider>
			<AppLayout />
		</PublicConfigProvider>
	);
}

export default App;
