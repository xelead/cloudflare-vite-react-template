import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
	plugins: [react(), cloudflare()],
	server: {
		allowedHosts: ["remotepc1.xelead.com"],
	},
	resolve: {
		alias: {
			"@src": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
