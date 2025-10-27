import { describe, expect, it } from "vitest";
import type { GenObject } from "~/entities/GenObject";
import { sanitizeGenObject } from "./sanitizeGenObject";

describe("sanitizeGenObject", () => {
	it("should detect array of GenObject", () => {
		// Arrange/Act
		const input: GenObject[] = [
			{ genName: "gen1", genId: "1", genMeta: {} },
			{ genName: "gen2", genId: "2", genMeta: {} },
		];

		const result = sanitizeGenObject(input);

		// Assert
		expect(result.isGenObject).toBe(true);
		expect(result.isArrays).toBe(true);
		expect(result.args).toEqual(input);
	});

	it("should detect single GenObject", () => {
		// Arrange/Act
		const input: GenObject = {
			genName: "single",
			genId: "123",
			genMeta: {},
		};

		const result = sanitizeGenObject(input);

		// Assert
		expect(result.isGenObject).toBe(true);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-genObject as raw", () => {
		// Arrange/Act
		const input = { foo: "bar" };

		const result = sanitizeGenObject(input);

		// Assert
		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-object values as raw", () => {
		// Arrange/Act
		const input = "just-a-string";

		const result = sanitizeGenObject(input);

		// Assert
		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toBe("just-a-string");
	});

	it("should handle empty array safely", () => {
		// Arrange/Act
		const input: unknown[] = [];

		const result = sanitizeGenObject(input);

		// Assert
		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual([]);
	});
});
