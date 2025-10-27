import { defineConfig } from "tsdown";

export default defineConfig({
	format: ["esm"],
	outDir: "dist",
	dts: true,
	clean: true,
	entry: ["src/index.ts", "src/entities/index.ts"],
});
