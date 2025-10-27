import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/config/global";
import { readGenFile } from "~/utils/readGenFile";

const mockRead = vi.fn((path: string) => ({ path, content: "mocked" }));
const mockStringTo = vi.fn((path: string) => ({ path, content: "mocked" }));

beforeEach(() => {
	mockRead.mockClear();
	clearGlobalConfig();
});

describe("readGenFile", () => {
	it("uses parentConfig values when provided", () => {
		// Arrange/Act
		setGlobalConfig({
			genFileExt: "ignored",
			genFileType: "ignored",
			findFile: {
				customExt: {
					customType: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readGenFile("file.txt", {
			genFileExt: "customExt",
			genFileType: "customType",
		});

		// Assert
		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("falls back to global config when parentConfig is null", () => {
		// Arrange/Act
		setGlobalConfig({
			genFileExt: "customExt",
			genFileType: "customType",
			findFile: {
				customExt: {
					customType: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readGenFile("file.txt", null);

		// Assert
		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("uses default constants when no config is available", () => {
		// Arrange/Act
		setGlobalConfig({
			findFile: {
				json: {
					camelCase: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readGenFile("file.txt", {
			genFileExt: undefined,
			genFileType: undefined,
		});

		// Assert
		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("throws when read function is missing", () => {
		// Arrange/Act
		setGlobalConfig({
			genFileExt: "missingExt",
			genFileType: "missingType",
			findFile: {},
		});

		// Assert
		expect(() => readGenFile("file.txt", null)).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("falls back to empty object when global config is undefined", () => {
		// Arrange/Act/Assert
		expect(() =>
			readGenFile("file.txt", {
				genFileExt: "json",
				genFileType: "camelCase",
			}),
		).toThrowError("Find files json camelCase read function doesn't exist");
	});
});
