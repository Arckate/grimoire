import { describe, expect, it } from "vitest";
import { formatError } from "./formatError";

describe("formatError", () => {
	it("should return the same Error instance if input is an Error", () => {
		// Arrange/Act
		const original = new Error("Original error");
		const result = formatError(original);

		// Assert
		expect(result).toBe(original);
		expect(result.message).toBe("Original error");
	});

	it("should convert a string to an Error", () => {
		// Arrange/Act
		const result = formatError("Something went wrong");

		// Assert
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe("Something went wrong");
	});

	it('should return "unknown" error for non-string, non-Error input', () => {
		// Arrange/Act
		const result = formatError({ unexpected: true });

		// Assert
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe("unknown");
	});
});
