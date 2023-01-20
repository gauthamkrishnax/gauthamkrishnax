import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-icon.png"],
			manifest: {
				name: "Gautham Krishna | Portfolio",
				short_name: "GauthamKrishna",
				description:
					"Gautham Krishna (Portfolio) - Specializing in developing and designing digital experiences that are both creative and user-friendly.",
				theme_color: "#000000",
				icons: [
					{
						src: "/icons/android-icon-36x36.png",
						sizes: "36x36",
						type: "image/png",
						density: "0.75",
					},
					{
						src: "/icons/android-icon-48x48.png",
						sizes: "48x48",
						type: "image/png",
						density: "1.0",
					},
					{
						src: "/icons/android-icon-72x72.png",
						sizes: "72x72",
						type: "image/png",
						density: "1.5",
					},
					{
						src: "/icons/android-icon-96x96.png",
						sizes: "96x96",
						type: "image/png",
						density: "2.0",
					},
					{
						src: "/icons/android-icon-144x144.png",
						sizes: "144x144",
						type: "image/png",
						density: "3.0",
					},
					{
						src: "/icons/android-icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
						density: "4.0",
					},
				],
			},
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/three")) {
						return id
							.toString()
							.split("node_modules/")[1]
							.split("/")[0]
							.toString();
					}
				},
			},
		},
	},
});
