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
		pool: "forks",
		maxWorkers: 4,
		execArgv: ["--max-old-space-size=1024"],
		setupFiles: ["vitest.setup.ts"],
		environment: "node",
		coverage: {
			enabled: true,
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
				"**/models/**",
				"**/*.d.ts",
				"**/__mocks__/**",
				"**/loadConfig.ts",
				"src/**/mockOldConfig.ts",
				"src/**/index.ts",
				"src/**/I*.ts",
			],
		},
	},
});
