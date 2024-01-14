import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    mode: "production",
	build: {
        minify: "esbuild",
		lib: {
			entry: fileURLToPath(new URL("index.ts", import.meta.url)),
			name: "@eznix/try",
			fileName: "try",
		},
	},
	plugins: [
		dts({
            insertTypesEntry: true,
			pathsToAliases: true,
			rollupTypes: true,
		}),
	],
	resolve: {
		alias: [
			{
				find: "~",
				replacement: fileURLToPath(new URL("./lib", import.meta.url)),
			},
		],
	},
});
