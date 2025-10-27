import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { highlightText } from "./highlightText";

describe("highlightText", () => {
	it("highlights a single word in the text", () => {
		// Arrange/Act
		const result = highlightText("The sky is blue", "blue");

		// Assert
		expect(result).toBe(`The sky is ${chalk.bold("blue")}`);
	});

	it("highlights multiple occurrences of the word", () => {
		// Arrange/Act
		const result = highlightText("Blue is blue", "blue");

		// Assert
		expect(result).toBe(`${chalk.bold("Blue")} is ${chalk.bold("blue")}`);
	});

	it("is case-insensitive", () => {
		// Arrange/Act
		const result = highlightText("The Sky Is BLUE", "blue");

		// Assert
		expect(result).toBe(`The Sky Is ${chalk.bold("BLUE")}`);
	});

	it("returns original text if word is not found", () => {
		// Arrange/Act
		const result = highlightText("The sky is blue", "green");

		// Assert
		expect(result).toBe("The sky is blue");
	});

	it("returns original text if word is empty", () => {
		// Arrange/Act
		const result = highlightText("The sky is blue", "");

		// Assert
		expect(result).toBe("The sky is blue");
	});

	it("handles special characters in the word", () => {
		// Arrange/Act
		const result = highlightText("Price is 100€", "100€");

		// Assert
		expect(result).toBe(`Price is ${chalk.bold("100€")}`);
	});
});
