import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
	const isFrappe = process.argv.some((arg) => arg.includes("/assets/cw_field_service_pwa"));
	const startUrl = isFrappe ? "/cw_field_service_pwa" : "/";
	const icon192 = isFrappe
		? "/assets/cw_field_service_pwa/manifest/manifest-icon-192.maskable.png"
		: "/manifest/manifest-icon-192.maskable.png";
	const icon512 = isFrappe
		? "/assets/cw_field_service_pwa/manifest/manifest-icon-512.maskable.png"
		: "/manifest/manifest-icon-512.maskable.png";

	return {
		root: __dirname,
		server: {
			port: 8080,
			proxy: getProxyOptions(),
		},
		plugins: [
			vue(),
			VitePWA({
				registerType: "autoUpdate",
				strategies: "injectManifest",
				srcDir: "public",
				filename: "sw.js",
				injectRegister: null,
				manifest: {
					display: "standalone",
					name: "C-Water Field Service",
					short_name: "CW Service",
					start_url: startUrl,
					scope: "/",
					description: "C-Water Mobile Field Service & Water Inspection PWA",
					theme_color: "#0284c7",
					background_color: "#f8fafc",
					icons: [
						{
							src: icon192,
							sizes: "192x192",
							type: "image/png",
							purpose: "any maskable",
						},
						{
							src: icon512,
							sizes: "512x512",
							type: "image/png",
							purpose: "any maskable",
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		build: {
			outDir: process.env.BUILD_OUT_DIR || "../cw_field_service_pwa/public/frontend",
			emptyOutDir: true,
			target: "es2020",
			sourcemap: true,
			rollupOptions: {
				output: {
					manualChunks: {
						"frappe-ui": ["frappe-ui"],
						"ionic": ["@ionic/vue", "@ionic/vue-router"],
					},
				},
			},
		},
	};
});

function getProxyOptions() {
	return {
		"^/(app|login|api|assets|files|private)": {
			target: "http://127.0.0.1:8000",
			ws: true,
			changeOrigin: true,
		},
	};
}
