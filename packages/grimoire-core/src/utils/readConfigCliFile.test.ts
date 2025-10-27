import { beforeEach, describe, expect, it, vi } from "vitest";
import { readConfigCliFile } from "~/utils";

const mockRead = vi.fn((path: string) => ({ path, config: "mocked" }));
const mockStringTo = vi.fn((path: string) => ({ path, content: "mocked" }));

beforeEach(() => {
	mockRead.mockClear();
});

describe("readConfigCliFile", () => {
	it("uses config values when provided", () => {
		const result = readConfigCliFile(
			{
				configFileExt: "customExt",
				configFileType: "customType",
				processor: {
					customExt: {
						customType: {
							read: mockRead,
							write: mockRead,
							stringTo: mockStringTo,
						},
					},
				},
			},
			"cli.config",
		);

		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("uses default constants when config has no ext/type", () => {
		const result = readConfigCliFile(
			{
				processor: {
					json: {
						camelCase: {
							read: mockRead,
							write: mockRead,
							stringTo: mockStringTo,
						},
					},
				},
			},
			"cli.config",
		);

		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("throws when read function is missing in processor", () => {
		expect(() =>
			readConfigCliFile(
				{
					configFileExt: "missingExt",
					configFileType: "missingType",
					processor: {},
				},
				"cli.config",
			),
		).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("throws with default ext/type when config is empty", () => {
		expect(() => readConfigCliFile({}, "cli.config")).toThrowError(
			"Find files json camelCase read function doesn't exist",
		);
	});

	it("throws when processor[ext] exists but processor[ext][type] does not", () => {
		expect(() =>
			readConfigCliFile(
				{
					configFileExt: "yaml",
					configFileType: "missingType",
					processor: {
						yaml: {},
					},
				},
				"cli.config",
			),
		).toThrowError("Find files yaml missingType read function doesn't exist");
	});
});
