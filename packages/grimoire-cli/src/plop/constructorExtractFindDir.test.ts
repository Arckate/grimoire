import path from "node:path";
import {
	clearDirnames,
	clearDirs,
	clearGlobalConfig,
	clearRoots,
	setDirnames,
	setDirs,
	setGlobalConfig,
	setRoots,
} from "@arckate/grimoire-core/config";
import { CLI_FOLDER, DIRS, ROOTS } from "@arckate/grimoire-core/const";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { constructorExtractFindDir } from "./constructorExtractFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
	clearDirnames();
});

describe("constructorExtractFindDir", () => {
	it("returns default path when no root is found", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "dir/sub",
		});

		const extract = constructorExtractFindDir();
		// Act
		const result = extract(DIRS.DIR)("file.ts");

		// Assert
		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});

	it("falls back to rootDir when config is partial", () => {
		// Arrange
		setDirnames({});
		setDirs({
			[DIRS.DIR]: "/ignored-dir",
			[DIRS.DEFAULT_DIR]: "/ignored-default",
			[DIRS.IN_PATH]: "dir/sub",
		});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});
		const extract = constructorExtractFindDir();

		// Act
		const result = extract("rootDir")("file.ts");

		// Assert
		expect(result).toBe(path.join("/my-root", CLI_FOLDER, "sub", "file.ts"));
	});

	it("parses name from IN_PATH when it matches REG_IS_DIRS", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[custom]/nested",
		});

		const extract = constructorExtractFindDir();

		// Act
		const result = extract(DIRS.DIR)("file.ts");

		// Assert
		expect(result).toBe(path.join("/base-dir", "nested", "file.ts"));
	});

	it("uses fallback when IN_PATH is empty", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();

		// Act
		const result = extract(DIRS.DIR)("file.ts");

		// Assert
		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses empty string when extraPath is undefined", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]/sub",
		});

		const extract = constructorExtractFindDir();

		// Act
		const result = extract(DIRS.DIR)("");

		// Assert
		expect(result).toBe(path.join("/base-dir", "sub"));
	});

	it("handles unknown nameDir gracefully", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();

		// Act
		const result = extract(DIRS.DIR)("file.ts");

		// Assert
		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("should return string empty when IN_PATH is empty", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]",
		});

		const extract = constructorExtractFindDir();

		// Act
		const result = extract(DIRS.DIR)("file.ts");

		// Arrange
		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses fallback nameDir from outer name when inner nameDir is undefined", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "dir/sub",
		});

		// Act
		const extract = constructorExtractFindDir();
		const result = extract("")("file.ts");

		// Assert
		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});
});
