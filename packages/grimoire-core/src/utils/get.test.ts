import { describe, expect, it } from "vitest";
import { get } from "./get";

describe("get", () => {
	it("should return the value at a simple path", () => {
		// Arrange/Act
		const obj = { a: { b: 42 } };

		// Assert
		expect(get(obj, "a.b")).toBe(42);
	});

	it("should return the value at a nested array path", () => {
		// Arrange/Act
		const obj = { a: { b: [{ c: "hello" }] } };

		// Assert
		expect(get(obj, "a.b[0].c")).toBe("hello");
	});

	it("should return the default value if path does not exist", () => {
		// Arrange/Act
		const obj = { a: { b: 1 } };

		// Assert
		expect(get(obj, "a.x.y", "default")).toBe("default");
	});

	it("should return the default value if object is null", () => {
		// Arrange/Act/Assert
		expect(get(null as any, "a.b", "fallback")).toBe("fallback");
	});

	it("should return the default value if object is undefined", () => {
		// Arrange/Act/Assert
		expect(get(undefined as any, "a.b", "fallback")).toBe("fallback");
	});

	it("should handle paths with brackets and dots", () => {
		// Arrange/Act
		const obj = { a: { "b.c": { d: 99 } } };

		// Assert
		expect(get(obj, 'a["b.c"].d')).toBe(99);
	});

	it("should return default if result equals the root object", () => {
		// Arrange/Act
		const obj = { a: 1 };

		// Assert
		expect(get(obj, "", "default")).toBe("default");
	});
});
