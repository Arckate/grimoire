import { describe, expect, it } from "vitest";
import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";
import { findConstructorArg } from "./findConstructorArg";

describe("findConstructorArg", () => {
	it("should return the first element from array if valid", () => {
		// Arrange/Act
		const input = ["myArg", "other"];
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBe("myArg");
	});

	it("should return null if first element is SKIP_PARAMS_VALUE", () => {
		// Arrange/Act
		const input = [SKIP_PARAMS_VALUE, "other"];
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBeNull();
	});

	it("should return null if array is empty", () => {
		// Arrange/Act
		const input: string[] = [];
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBeNull();
	});

	it("should return null if array has only one SKIP_PARAMS_VALUE", () => {
		// Arrange/Act
		const input = [SKIP_PARAMS_VALUE];
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBeNull();
	});

	it("should return value from object if key exists", () => {
		// Arrange/Act
		const input = { name: "projectName", type: "ts" };
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBe("projectName");
	});

	it("should return null if key does not exist in object", () => {
		// Arrange/Act
		const input = { type: "ts" };
		const result = findConstructorArg(input, "name", {});

		// Assert
		expect(result).toBeNull();
	});

	it("should return value from innerFilters if key exists", () => {
		// Arrange/Act
		const input = ["ignored"]; // args won't matter because innerFilters has priority
		const innerFilters = { name: "filteredValue" };
		const result = findConstructorArg(input, "name", innerFilters);

		// Assert
		expect(result).toBe("filteredValue");
	});
});
