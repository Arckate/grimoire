import { beforeEach, describe, expect, it, vi } from "vitest";
import { SKIP_PARAMS_KEY } from "~/const/skippedParams";
import { findSkippedParams } from "./findSkippedParams";

const mockCommand = {
	options: [{ flags: "--foo <value>" }, { flags: "--bar <value>" }],
	_helpOption: { flags: "--help" },
	parent: {
		rawArgs: ["--skipFromParent", "parentValue"],
	},
};

const mockProgram = {
	parseOptions: vi.fn(),
};

describe("findSkippedParams", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("should extract skipped params after separator", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: [
				"--foo",
				"123",
				SKIP_PARAMS_KEY,
				"--skip1",
				"val1",
				"--skip2",
				"val2",
			],
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({
			skip1: "val1",
			skip2: "val2",
		});
	});

	it("should ignore options before skipped params", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: ["--bar", "456", "--", "--skip", "value"],
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({
			skip: "value",
		});
	});

	it("should handle no skipped params", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: ["--foo", "123"],
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({});
	});

	it("should handle multiple options and skip correctly", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: [
				"--foo",
				"123",
				"--bar",
				"456",
				"--",
				"--skipA",
				"A",
				"--skipB",
				"B",
			],
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({
			skipA: "A",
			skipB: "B",
		});
	});

	it("should remove args between option and next SKIP_PARAMS_KEY", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: ["--foo", "123", "--skip1", "val1"],
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({
			skip1: "val1",
		});
	});

	it("should fallback to cmdRawArgs when rawArgs is empty", () => {
		// Arrange/Act
		mockProgram.parseOptions.mockReturnValue({
			unknown: [], // rawArgs vide
		});

		const result = findSkippedParams(mockProgram as any, mockCommand);

		// Assert
		expect(result).toEqual({
			skipFromParent: "parentValue",
		});
	});
});
