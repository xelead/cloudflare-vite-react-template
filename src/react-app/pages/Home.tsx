import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "../assets/Cloudflare_Logo.svg";
import honoLogo from "../assets/hono.svg";

function Home() {
	const [count, setCount] = useState(0);
	const [name, setName] = useState("unknown");

	return (
		<div className="page">
			<section className="hero">
				<div className="hero-logos">
					<a href="https://vite.dev" target="_blank">
						<img src={viteLogo} className="logo" alt="Vite logo" />
					</a>
					<a href="https://react.dev" target="_blank">
						<img src={reactLogo} className="logo react" alt="React logo" />
					</a>
					<a href="https://hono.dev/" target="_blank">
						<img src={honoLogo} className="logo cloudflare" alt="Hono logo" />
					</a>
					<a href="https://workers.cloudflare.com/" target="_blank">
						<img
							src={cloudflareLogo}
							className="logo cloudflare"
							alt="Cloudflare logo"
						/>
					</a>
				</div>
				<div className="hero-copy">
					<h1>Vite + React + Hono + Cloudflare</h1>
					<p>
						A clean template for shipping full-stack apps with a Worker API and
						 Vite-powered UI.
					</p>
				</div>
			</section>

			<section className="grid">
				<div className="card">
					<h2>Counter</h2>
					<p>Quick UI state check while you iterate.</p>
					<button
						onClick={() => setCount((value) => value + 1)}
						aria-label="increment"
					>
						count is {count}
					</button>
				</div>
				<div className="card">
					<h2>Worker API</h2>
					<p>Fetches a value from the Worker running your API routes.</p>
					<button
						onClick={() => {
							fetch("/api/")
								.then((res) => res.json() as Promise<{ name: string }>)
								.then((data) => setName(data.name));
						}}
						aria-label="get name"
					>
						Name from API is: {name}
					</button>
				</div>
			</section>
		</div>
	);
}

export default Home;
