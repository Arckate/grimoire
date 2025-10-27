import { describe, expect, it } from "vitest";
import { extractAllInitsConfig } from "./extractAllInitsConfig";

describe("extractAllInitsConfig", () => {
	it("should extract all inits configs when present", () => {
		// Arrange/Act
		const input = {
			defaultDirConfig: { inits: { a: 1 } },
			dirConfig: { inits: { b: 2 } },
			rootConfig: { inits: { c: 3 } },
		};

		const result = extractAllInitsConfig(input as any);

		// Assert
		expect(result).toEqual({
			defaultDirConfig: { a: 1 },
			dirConfig: { b: 2 },
			rootConfig: { c: 3 },
		});
	});

	it("should return null for missing inits keys", () => {
		// Arrange/Act
		const input = {
			defaultDirConfig: {},
			dirConfig: null,
			rootConfig: { inits: { c: 3 } },
		};

		const result = extractAllInitsConfig(input as any);

		// Assert
		expect(result).toEqual({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: { c: 3 },
		});
	});

	it("should return all null when input is empty", () => {
		// Arrange/Act
		const result = extractAllInitsConfig({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: null,
		});

		// Assert
		expect(result).toEqual({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: null,
		});
	});
});
