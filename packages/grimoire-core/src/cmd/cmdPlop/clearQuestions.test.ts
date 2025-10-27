import { describe, expect, it, vi } from "vitest";
import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";
import * as removeLineModule from "~/prompts/removeLine";
import { clearQuestions } from "./clearQuestions";

describe("clearQuestions", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	it("should call removeLine with 0 when args and sanitizeArgs match", () => {
		// Arrange/Act
		const removeLineMock = vi
			.spyOn(removeLineModule, "removeLine")
			.mockImplementation(() => {});
		const args = ["Alice", "30"];
		const sanitizeArgs = { name: "Alice", age: "30" };

		clearQuestions(processTerm, args, sanitizeArgs);

		// Assert
		expect(removeLineMock).toHaveBeenCalledWith({ processTerm, nb: 0 });
	});

	it("should call removeLine with positive number when args contain SKIP_PARAMS_VALUE", () => {
		// Arrange/Act
		const removeLineMock = vi
			.spyOn(removeLineModule, "removeLine")
			.mockImplementation(() => {});
		const args = ["Alice", SKIP_PARAMS_VALUE];
		const sanitizeArgs = { name: "Alice", age: "30" };

		clearQuestions(processTerm, args, sanitizeArgs);

		// Assert
		expect(removeLineMock).toHaveBeenCalledWith({ processTerm, nb: 1 });
	});

	it("should call removeLine with full count when all args are skipped", () => {
		// Arrange/Act
		const removeLineMock = vi
			.spyOn(removeLineModule, "removeLine")
			.mockImplementation(() => {});
		const args = [SKIP_PARAMS_VALUE, SKIP_PARAMS_VALUE];
		const sanitizeArgs = { name: "Alice", age: "30" };

		clearQuestions(processTerm, args, sanitizeArgs);

		// Assert
		expect(removeLineMock).toHaveBeenCalledWith({ processTerm, nb: 2 });
	});

	it("should handle empty args and sanitizeArgs", () => {
		// Arrange/Act
		const removeLineMock = vi
			.spyOn(removeLineModule, "removeLine")
			.mockImplementation(() => {});
		const args: string[] = [];
		const sanitizeArgs = {};

		clearQuestions(processTerm, args, sanitizeArgs);

		// Assert
		expect(removeLineMock).toHaveBeenCalledWith({ processTerm, nb: 0 });
	});
});
