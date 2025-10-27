import { describe, expect, it } from "vitest";
import { mergeReplaceObject } from "./mergeReplaceObject";

describe("mergeReplaceObject", () => {
	it("should replace all keys in oldObject with keys from newValues", () => {
		// Arrange/Act
		const oldObject: Record<string, unknown> = {
			a: 1,
			b: 2,
			c: 3,
		};

		const newValues: Record<string, unknown> = {
			x: "new",
			y: true,
		};

		mergeReplaceObject(oldObject, newValues);

		// Assert
		expect(oldObject).toEqual({
			x: "new",
			y: true,
		});
	});

	it("should handle empty oldObject", () => {
		// Arrange/Act
		const oldObject: Record<string, unknown> = {};
		const newValues: Record<string, unknown> = { a: 42 };

		mergeReplaceObject(oldObject, newValues);

		// Assert
		expect(oldObject).toEqual({ a: 42 });
	});

	it("should handle empty newValues", () => {
		// Arrange/Act
		const oldObject: Record<string, unknown> = { a: 1, b: 2 };
		const newValues: Record<string, unknown> = {};

		mergeReplaceObject(oldObject, newValues);

		// Assert
		expect(oldObject).toEqual({});
	});

	it("should mutate the original object", () => {
		// Arrange/Act
		const original = { a: "keep" };
		const replacement = { b: "new" };

		mergeReplaceObject(original, replacement);

		// Assert
		expect(original).toEqual({ b: "new" });
	});
});
