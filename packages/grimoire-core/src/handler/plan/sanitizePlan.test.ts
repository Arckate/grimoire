import { describe, expect, it } from "vitest";
import type { Plan } from "~/models";
import { sanitizePlan } from "./sanitizePlan";

describe("sanitizePlan", () => {
	it("should detect array of Plan", () => {
		// Arrange/Act
		const input: Plan[] = [
			{ genName: "gen1", genId: "1", genMeta: {} },
			{ genName: "gen2", genId: "2", genMeta: {} },
		];

		const result = sanitizePlan(input);

		// Assert
		expect(result.isPlan).toBe(true);
		expect(result.isArrays).toBe(true);
		expect(result.args).toEqual(input);
	});

	it("should detect single Plan", () => {
		// Arrange/Act
		const input: Plan = {
			genName: "single",
			genId: "123",
			genMeta: {},
		};

		const result = sanitizePlan(input);

		// Assert
		expect(result.isPlan).toBe(true);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-plan as raw", () => {
		// Arrange/Act
		const input = { foo: "bar" };

		const result = sanitizePlan(input);

		// Assert
		expect(result.isPlan).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-object values as raw", () => {
		// Arrange/Act
		const input = "just-a-string";

		const result = sanitizePlan(input);

		// Assert
		expect(result.isPlan).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toBe("just-a-string");
	});

	it("should handle empty array safely", () => {
		// Arrange/Act
		const input: unknown[] = [];

		const result = sanitizePlan(input);

		// Assert
		expect(result.isPlan).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual([]);
	});
});
