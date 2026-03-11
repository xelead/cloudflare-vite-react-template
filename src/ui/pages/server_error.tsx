import { Link } from "react-router-dom";

function ServerErrorPage() {
	return (
		<div className="page">
			<section className="hero hero-slim">
				<div className="hero-copy">
					<h1>Server error</h1>
					<p>Something went wrong while rendering this page.</p>
				</div>
			</section>

			<section className="card">
				<h2>500</h2>
				<p className="status-card status-error">
					Please try again in a moment. If this continues, contact support.
				</p>
				<Link className="project-link" to="/">
					Return to home
				</Link>
			</section>
		</div>
	);
}

export default ServerErrorPage;
