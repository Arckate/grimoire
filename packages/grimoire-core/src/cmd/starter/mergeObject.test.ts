import { beforeEach, describe, expect, it, vi } from "vitest";
import { mergeObject } from "./mergeObject";
import { mergeReplaceObject } from "./mergeReplaceObject";

vi.mock("./mergeReplaceObject", () => ({
	mergeReplaceObject: vi.fn(),
}));

const mockedMergeReplaceObject = mergeReplaceObject as unknown as ReturnType<
	typeof vi.fn
>;

describe("mergeObject", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return true and call mergeReplaceObject when objValue has key and srcValue has other keys", () => {
		// Arrange/Act
		const objValue = { generator: "comp" };
		const srcValue = { in: "files" };

		const result = mergeObject({
			key: "generator",
			arrayKey: ["in", "question", "keyFilter", "starterName"],
			objValue,
			srcValue,
		});

		// Assert
		expect(result).toBe(true);
		expect(mockedMergeReplaceObject).toHaveBeenCalledWith(objValue, srcValue);
	});

	it("should return false when objValue has key but srcValue has no other keys", () => {
		// Arrange/Act
		const objValue = { generator: "comp" };
		const srcValue = {}; // no other keys

		const result = mergeObject({
			key: "generator",
			arrayKey: ["in", "question", "keyFilter", "starterName"],
			objValue,
			srcValue,
		});

		// Assert
		expect(result).toBe(false);
		expect(mockedMergeReplaceObject).not.toHaveBeenCalled();
	});

	it("should return false when objValue has key and srcValue also has the same key", () => {
		// Arrange/Act
		const objValue = { generator: "comp" };
		const srcValue = { generator: "comp", in: "files" };

		const result = mergeObject({
			key: "generator",
			arrayKey: ["in", "question", "keyFilter", "starterName"],
			objValue,
			srcValue,
		});

		// Assert
		expect(result).toBe(false);
		expect(mockedMergeReplaceObject).not.toHaveBeenCalled();
	});

	it("should return false when objValue does not have key", () => {
		// Arrange/Act
		const objValue = { in: "files" };
		const srcValue = { generator: "comp" };

		const result = mergeObject({
			key: "generator",
			arrayKey: ["in", "question", "keyFilter", "starterName"],
			objValue,
			srcValue,
		});

		// Assert
		expect(result).toBe(false);
		expect(mockedMergeReplaceObject).not.toHaveBeenCalled();
	});

	it("should return false when objValue has key but also has other keys", () => {
		// Arrange/Act
		const objValue = { generator: "comp", question: "Choose" };
		const srcValue = { in: "files" };

		const result = mergeObject({
			key: "generator",
			arrayKey: ["in", "question", "keyFilter", "starterName"],
			objValue,
			srcValue,
		});

		// Assert
		expect(result).toBe(false);
		expect(mockedMergeReplaceObject).not.toHaveBeenCalled();
	});
});
