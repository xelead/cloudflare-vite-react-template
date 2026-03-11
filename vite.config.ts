import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
	plugins: [react(), cloudflare()],
	cacheDir: "node_modules/.vite_cf_dev",
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name][extname]",
			},
		},
	},
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
		allowedHosts: ["remotepc1.xelead.com"],
	},
	resolve: {
		alias: {
			"@src": fileURLToPath(new URL("./src", import.meta.url)),
			"punycode/": "punycode/punycode.js",
		},
	},
});
