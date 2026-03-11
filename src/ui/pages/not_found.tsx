import { Link } from "react-router-dom";

function NotFoundPage() {
	return (
		<div className="page">
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>Page not found</h1>
					<p>The page you requested does not exist or was moved.</p>
				</div>
			</section>

			<section className="card">
				<h2>404</h2>
				<p className="status-card status-error">
					We could not find this route. Use the navigation or go back home.
				</p>
				<Link className="project-link" to="/">
					Return to home
				</Link>
			</section>
		</div>
	);
}

export default NotFoundPage;
