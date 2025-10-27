import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	readCamelCaseJson,
	stringToCamelCaseJson,
	writeCamelCaseJson,
} from "./findCamelCaseJson";

vi.mock("node:fs");

beforeEach(() => {
	vi.resetAllMocks();
});

describe("readCamelCaseJson", () => {
	it("reads and parses valid JSON file", () => {
		// Arrange/Act
		const mockContent = JSON.stringify({
			keyOne: "valueOne",
			keyTwo: "valueTwo",
		});
		vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

		const result = readCamelCaseJson("config.json");

		// Assert
		expect(fs.readFileSync).toHaveBeenCalledWith("config.json", "utf-8");
		expect(result).toEqual({ keyOne: "valueOne", keyTwo: "valueTwo" });
	});

	it("throws error when file does not exist", () => {
		// Arrange/Act/Assert
		vi.mocked(fs.readFileSync).mockImplementation(() => {
			throw new Error("File not found");
		});

		expect(() => readCamelCaseJson("missing.json")).toThrowError(
			"Failed to read or parse JSON at missing.json",
		);
	});

	it("throws error when JSON is invalid", () => {
		// Arrange/Act/Assert
		vi.mocked(fs.readFileSync).mockReturnValue("{ invalid json }");

		expect(() => readCamelCaseJson("broken.json")).toThrowError(
			"Failed to read or parse JSON at broken.json",
		);
	});
});

describe("writeCamelCaseJson", () => {
	it("writes JSON data to file", () => {
		// Arrange/Act
		const data = { keyOne: "valueOne", keyTwo: "valueTwo" };
		writeCamelCaseJson("output.json", data);

		// Assert
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			"output.json",
			JSON.stringify(data, null, 2),
			"utf-8",
		);
	});

	it("throws error when write fails", () => {
		// Arrange/Act/Assert
		vi.mocked(fs.writeFileSync).mockImplementation(() => {
			throw new Error("Disk full");
		});

		expect(() =>
			writeCamelCaseJson("output.json", { key: "value" }),
		).toThrowError("Failed to write JSON to output.json");
	});
});

describe("stringToCamelCaseJson", () => {
	it("parses valid JSON string", () => {
		// Arrange/Act
		const input = '{"keyOne":"valueOne","keyTwo":"valueTwo"}';
		const result = stringToCamelCaseJson(input);

		// Assert
		expect(result).toEqual({ keyOne: "valueOne", keyTwo: "valueTwo" });
	});

	it("throws error when JSON string is invalid", () => {
		// Arrange/Act/Assert
		const input = "{ invalid json }";
		expect(() => stringToCamelCaseJson(input)).toThrowError(
			"Failed to parse JSON from text",
		);
	});
});
