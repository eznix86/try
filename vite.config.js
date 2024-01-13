import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("index.ts", import.meta.url)),
      name: "try-async",
      fileName: "try-async",
    },
  },
  plugins: [dts()],
  resolve: {
    alias: [
      {
        find: "~",
        replacement: fileURLToPath(new URL("./lib", import.meta.url)),
      },
    ],
  },
});
