import { describe, expect, it } from "vitest";
import { capitalizeFirst } from "./capitalizeFirst";

describe("capitalizeFirst", () => {
	it("should capitalize the first letter of a lowercase word", () => {
		// Arrange/Act/Assert
		expect(capitalizeFirst("hello")).toBe("Hello");
	});

	it("should not change a word that already starts with uppercase", () => {
		// Arrange/Act/Assert
		expect(capitalizeFirst("World")).toBe("World");
	});

	it("should handle empty string gracefully", () => {
		// Arrange/Act/Assert
		expect(capitalizeFirst("")).toBe("");
	});

	it("should work with single character strings", () => {
		// Arrange/Act/Assert
		expect(capitalizeFirst("a")).toBe("A");
		expect(capitalizeFirst("Z")).toBe("Z");
	});

	it("should preserve the rest of the string unchanged", () => {
		// Arrange/Act/Assert
		expect(capitalizeFirst("testCase")).toBe("TestCase");
	});
});
