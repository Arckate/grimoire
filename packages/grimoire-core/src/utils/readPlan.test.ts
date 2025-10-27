import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cli } from "~/Cli";
import { readPlan } from "~/utils";

const mockRead = vi.fn((path: string) => ({ path, content: "mocked" }));
const mockStringTo = vi.fn((path: string) => ({ path, content: "mocked" }));

const makeCli = (config: Record<string, any>): Cli =>
	({ getConfig: () => config }) as unknown as Cli;

beforeEach(() => {
	mockRead.mockClear();
});

describe("readPlan", () => {
	it("uses parentConfig values when provided", () => {
		const cli = makeCli({
			planExt: "ignored",
			planType: "ignored",
			processor: {
				customExt: {
					customType: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readPlan(cli, "file.txt", {
			planExt: "customExt",
			planType: "customType",
		});

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("falls back to cli config when parentConfig is null", () => {
		const cli = makeCli({
			planExt: "customExt",
			planType: "customType",
			processor: {
				customExt: {
					customType: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readPlan(cli, "file.txt", null);

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("uses default constants when parentConfig has no ext/type", () => {
		const cli = makeCli({
			processor: {
				json: {
					camelCase: {
						read: mockRead,
						write: mockRead,
						stringTo: mockStringTo,
					},
				},
			},
		});

		const result = readPlan(cli, "file.txt", {
			planExt: undefined,
			planType: undefined,
		});

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("throws when read function is missing", () => {
		const cli = makeCli({
			planExt: "missingExt",
			planType: "missingType",
			processor: {},
		});

		expect(() => readPlan(cli, "file.txt", null)).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("throws when no processor is configured", () => {
		const cli = makeCli({});

		expect(() =>
			readPlan(cli, "file.txt", {
				planExt: "json",
				planType: "camelCase",
			}),
		).toThrowError("Find files json camelCase read function doesn't exist");
	});
});
