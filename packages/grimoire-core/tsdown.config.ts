import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	format: ["esm"],
	outDir: "dist",
	dts: true,
	clean: true,
	entry: [
		"src/index.ts",
		"src/config/index.ts",
		"src/utils/index.ts",
		"src/prompts/index.ts",
		"src/errors/index.ts",
		"src/path/index.ts",
		"src/const/index.ts",
		"src/cmd/index.ts",
		"src/entities/index.ts",
	],
	alias: {
		"~": path.resolve(__dirname, "src"),
	},
});
