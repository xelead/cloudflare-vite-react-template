import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../App";
import { ProjectsDataProvider } from "../state/projects-data";
import type { ProjectsResponse } from "../types/projects";
import appStyles from "../App.css?raw";
import baseStyles from "../index.css?raw";

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

export function render(url: string, data: ProjectsResponse): RenderResult {
	const initialData = JSON.stringify(data).replace(/</g, "\\u003c");
	const styles = `${baseStyles}\n${appStyles}`;

	const appHtml = renderToString(
		<Document initialData={initialData} styles={styles}>
			<ProjectsDataProvider data={data}>
				<StaticRouter location={url}>
					<App />
				</StaticRouter>
			</ProjectsDataProvider>
		</Document>
	);

	return {
		html: `<!doctype html>${appHtml}`,
	};
}
