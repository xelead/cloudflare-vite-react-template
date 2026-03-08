import { NavLink } from "react-router-dom";
import "@src/ui/app.css";
import AppRoutes from "@src/ui/app_routes";

function App() {
	return (
		<div className="app">
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

export default App;
