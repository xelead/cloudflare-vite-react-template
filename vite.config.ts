import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const useWranglerPlugin = process.env.USE_WRANGLER === "true";

export default defineConfig(async () => {
	const plugins = [react()];

	if (useWranglerPlugin) {
		const { cloudflare } = await import("@cloudflare/vite-plugin");
		plugins.push(cloudflare());
	}

	return {
		plugins,
		cacheDir: "node_modules/.vite_cf_dev",
		optimizeDeps: {
			exclude: ["mongodb"],
			include: ["punycode", "punycode/", "tr46", "whatwg-url"],
		},
		ssr: {
			external: ["mongodb"],
			optimizeDeps: {
				exclude: ["mongodb"],
				include: ["punycode", "punycode/", "tr46", "whatwg-url"],
			},
		},
		server: {
			port: 9010,
			allowedHosts: ["remotepc1.xelead.com"],
		},
		resolve: {
			alias: {
				"@src": fileURLToPath(new URL("./src", import.meta.url)),
				"punycode/": "punycode/punycode.js",
			},
		},
	};
});
