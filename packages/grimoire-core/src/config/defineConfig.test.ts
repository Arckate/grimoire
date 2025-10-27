import { describe, expect, it } from "vitest";
import { defineConfig } from "./defineConfig";

describe("defineConfig", () => {
	it("returns the config object as-is", () => {
		const config = { name: "my-cli", version: "1.0.0" };

		expect(defineConfig(config)).toBe(config);
	});

	it("returns an empty object unchanged", () => {
		const config = {};

		expect(defineConfig(config)).toBe(config);
	});

	it("preserves InfoConfig fields", () => {
		const config = {
			name: "my-cli",
			description: "A CLI tool",
			configFile: "grimoire",
			configFileExt: "ts",
			planExt: "json",
		};

		const result = defineConfig(config);

		expect(result.name).toBe("my-cli");
		expect(result.configFile).toBe("grimoire");
		expect(result.planExt).toBe("json");
	});

	it("preserves UtilsConfig fields", () => {
		const config = {
			globals: { env: "prod" },
			templateType: "hbs",
		};

		const result = defineConfig(config);

		expect(result.globals).toEqual({ env: "prod" });
		expect(result.templateType).toBe("hbs");
	});
});
