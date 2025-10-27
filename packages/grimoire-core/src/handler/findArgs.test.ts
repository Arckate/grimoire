import { describe, expect, it } from "vitest";
import { findArgs } from "./findArgs";

describe("findArgs", () => {
	it("should return [defaultArgs[0], rawArgs] when rawArgs is not empty", () => {
		// Arrange/Act
		const defaultArgs = ["default", "--flag"];
		const rawArgs = { skip: "value" };

		const result = findArgs(defaultArgs, rawArgs);
		// Assert
		expect(result).toEqual(["default", { skip: "value" }]);
	});

	it("should return defaultArgs when rawArgs is empty", () => {
		// Arrange/Act
		const defaultArgs = ["default", "--flag"];
		const rawArgs = {};

		const result = findArgs(defaultArgs, rawArgs);
		// Assert
		expect(result).toEqual(defaultArgs);
	});
});
