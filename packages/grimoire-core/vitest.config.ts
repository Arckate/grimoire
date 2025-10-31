import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "src"),
		},
	},
	test: {
		globals: true,
		setupFiles: ["vitest.setup.ts"],
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["html", "lcov", "text"],
			include: ["src/**/*.ts", ".cli/**/*.ts"],
			exclude: [
				"**/*.test.ts",
				"**/test/**",
				"**/const/**",
				"**/errors/**",
				"**/*.test.ts",
				"**/types/**",
				"**/entities/**",
				"**/*.d.ts",
				"**/__mocks__/**",
				"**/loadConfig.ts",
				"src/**/mockOldConfig.ts",
				"src/**/index.ts",
			],
		},
	},
});
