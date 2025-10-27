import { describe, expect, it } from "vitest";
import { isGenFile } from "./isGenFile";

describe("isGenFile", () => {
	it("returns true for file ending with .gen.json", () => {
		// Arrange/Act/Assert
		expect(isGenFile("/some/path/data.gen.json", null)).toBe(true);
		expect(isGenFile("data.gen.json", null)).toBe(true);
		expect(isGenFile("./data.gen.json", null)).toBe(true);
	});

	it("returns false for file ending with .json but not .gen.json", () => {
		// Arrange/Act/Assert
		expect(isGenFile("/some/path/data.json", null)).toBe(false);
		expect(isGenFile("data.config.json", null)).toBe(false);
		expect(isGenFile("gen.data.json", null)).toBe(false);
	});

	it("returns false for non-json files", () => {
		// Arrange/Act/Assert
		expect(isGenFile("data.gen.js", null)).toBe(false);
		expect(isGenFile("data.gen.txt", null)).toBe(false);
	});

	it("returns false for directories", () => {
		// Arrange/Act/Assert
		expect(isGenFile("/some/path/gen.json/", null)).toBe(false);
	});
});
