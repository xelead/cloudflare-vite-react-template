import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "@src/react-app/App";
import { PeopleDataProvider } from "@src/react-app/modules/people/people_data.tsx";
import { ProjectsDataProvider } from "@src/react-app/modules/projects/projects_data.tsx";
import type { AppInitialData } from "@src/react-app/types/app_initial_data.ts";
import appStyles from "@src/react-app/App.css?raw";
import baseStyles from "@src/react-app/index.css?raw";

type RenderResult = {
	html: string;
};

function Document({
	children,
	initialData,
	styles,
}: {
	children: ReactNode;
	initialData: string;
	styles: string;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/svg+xml" href="/vite.svg" />
				<style>{styles}</style>
			</head>
			<body>
				<div id="root">{children}</div>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.__INITIAL_DATA__ = ${initialData};`,
					}}
				/>
			</body>
		</html>
	);
}

export function render(url: string, data: AppInitialData): RenderResult {
	const resolved_data: AppInitialData = {
		projects: data.projects ?? [],
		people: data.people ?? [],
	};
	const initialData = JSON.stringify(resolved_data).replace(/</g, "\\u003c");
	const styles = `${baseStyles}\n${appStyles}`;

	const appHtml = renderToString(
		<Document initialData={initialData} styles={styles}>
			<ProjectsDataProvider data={{ projects: resolved_data.projects }}>
				<PeopleDataProvider data={{ people: resolved_data.people }}>
					<StaticRouter location={url}>
						<App />
					</StaticRouter>
				</PeopleDataProvider>
			</ProjectsDataProvider>
		</Document>,
	);

	return {
		html: `<!doctype html>${appHtml}`,
	};
}
