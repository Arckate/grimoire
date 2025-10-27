import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/config/global";
import { readConfigCliFile } from "~/utils/readConfigCliFile";

const mockRead = vi.fn((path: string) => ({ path, config: "mocked" }));
const mockStringTo = vi.fn((path: string) => ({ path, content: "mocked" }));

beforeEach(() => {
	mockRead.mockClear();
	clearGlobalConfig();
});

describe("readConfigCliFile", () => {
	it("uses global config values when available", () => {
		// Arrange/Act
		setGlobalConfig({
			configFileExt: "customExt",
			configFileType: "customType",
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

		const result = readConfigCliFile("cli.config");

		// Assert
		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("uses default constants when global config is missing", () => {
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

		const result = readConfigCliFile("cli.config");

		// Assert
		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("throws when read function is missing in findFile", () => {
		// Arrange/Act
		setGlobalConfig({
			configFileExt: "missingExt",
			configFileType: "missingType",
			findFile: {},
		});

		// Assert
		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("falls back to empty object when global config is undefined", () => {
		// Arrange/Act/Assert
		// No setGlobalConfig call → getGlobalConfig() returns undefined
		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files json camelCase read function doesn't exist",
		);
	});

	it("throws when findFile[ext] exists but not findFile[ext][type]", () => {
		// Arrange/Act
		setGlobalConfig({
			configFileExt: "yaml",
			configFileType: "missingType",
			findFile: {
				yaml: {
					// missingType intentionally omitted
				},
			},
		});

		// Assert
		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files yaml missingType read function doesn't exist",
		);
	});
});
