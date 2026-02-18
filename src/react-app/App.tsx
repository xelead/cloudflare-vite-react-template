import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Projects from "./pages/Projects";

function App() {
	return (
		<div className="app">
			<header className="site-header">
				<div className="brand">Cloudflare Vite React</div>
				<nav className="nav">
					<NavLink to="/" end>
						Home
					</NavLink>
					<NavLink to="/projects" reloadDocument>
						Projects
					</NavLink>
				</nav>
			</header>
			<main className="content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/projects" element={<Projects />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
