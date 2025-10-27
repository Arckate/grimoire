import path from "node:path";
import { DIRS } from "@arckate/grimoire-core/const";
import { describe, expect, it, vi } from "vitest";
import { constructorInitFindDir } from "./constructorInitFindDir";

// Mock getDirs and getDirnames
const MockGetDirs = vi.fn((key: string) => {
	if (key === DIRS.DEFAULT_DIR) return "/default";
	if (key === DIRS.DIR) return "/main";
	return "";
});

vi.mock("@arckate/grimoire-core/config", () => ({
	getDirs: (params: any) => MockGetDirs(params),
	getDirnames: vi.fn(() => ({
		custom: "/custom",
		other: "/other",
	})),
}));

describe("constructorInitFindDir", () => {
	it("returns correct path for known nameDir", () => {
		// Arrange
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory("custom");
		const result = resolver("file.txt");

		// Assert
		expect(result).toBe(path.join("/custom", "file.txt"));
	});

	it("uses DIRS.DIR as fallback when nameDir is missing", () => {
		// Arrange
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory();
		const result = resolver("file.txt");

		// Assert
		expect(result).toBe(path.join("/main", "file.txt"));
	});

	it("uses DIRS.DIR as fallback when nameDir is unknown", () => {
		// Arrange
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory("unknown");
		const result = resolver("file.txt");

		// Assert
		expect(result).toBe(path.join("/main", "file.txt"));
	});

	it("returns base path when extraPath is empty", () => {
		// Arrange
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory("other");
		const result = resolver("other");

		// Assert
		expect(result).toBe("/other/other");
	});

	it("returns correct path when name is passed to outer function", () => {
		// Arrange
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory("custom");
		const result = resolver("");

		// Assert
		expect(result).toBe("/custom");
	});

	it("uses empty string when getDirs(DIRS.DEFAULT_DIR) returns undefined", () => {
		// Arrange
		MockGetDirs.mockReturnValue("");
		const initFactory = constructorInitFindDir();

		// Act
		const resolver = initFactory("defaultDir");
		const result = resolver("file.txt");

		// Assert
		expect(result).toBe(path.join("", "file.txt"));
	});
});
