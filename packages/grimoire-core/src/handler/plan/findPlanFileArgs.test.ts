import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { FilePathError } from "~/errors";
import {
	findAllPlanFile,
	isPlanFile,
	pathConstructor,
	pathValidating,
} from "~/path";
import { findPlanFileArgs } from "./findPlanFileArgs";

vi.mock("~/path/pathConstructor", () => ({ pathConstructor: vi.fn() }));
vi.mock("~/path/pathValidating", () => ({ pathValidating: vi.fn() }));
vi.mock("~/path/findAllPlanFile", () => ({ findAllPlanFile: vi.fn() }));
vi.mock("~/path/isPlanFile", () => ({ isPlanFile: vi.fn() }));

const makeCli = (): Cli => ({ getProcessTerm: () => ({}) }) as unknown as Cli;

beforeEach(() => {
	vi.resetAllMocks();
	(pathConstructor as Mock).mockResolvedValue("/mock/path/file.plan.json");
	(pathValidating as Mock).mockResolvedValue({
		isValidPath: true,
		isDirectory: false,
		isFile: true,
	});
	(isPlanFile as Mock).mockReturnValue(true);
	(findAllPlanFile as Mock).mockResolvedValue(["a.plan.json", "b.plan.json"]);
});

describe("findPlanFileArgs", () => {
	it("returns array with the file path when path is a valid plan file", async () => {
		const cli = makeCli();

		const result = await findPlanFileArgs({
			cli,
			inPath: "/mock/path/file.plan.json",
			parentConfig: null,
		});

		expect(result).toEqual(["/mock/path/file.plan.json"]);
	});

	it("returns array of all plan files when path is a directory", async () => {
		const cli = makeCli();
		(pathConstructor as Mock).mockResolvedValue("/mock/path");
		(pathValidating as Mock).mockResolvedValue({
			isValidPath: true,
			isDirectory: true,
			isFile: false,
		});

		const result = await findPlanFileArgs({
			cli,
			inPath: "/mock/path",
			parentConfig: null,
		});

		expect(result).toEqual(["a.plan.json", "b.plan.json"]);
	});

	it("returns undefined when path is not valid", async () => {
		const cli = makeCli();
		(pathValidating as Mock).mockResolvedValue({
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		});

		const result = await findPlanFileArgs({
			cli,
			inPath: "/invalid/path",
			parentConfig: null,
		});

		expect(result).toBeUndefined();
	});

	it("throws FilePathError when file is not a plan file", async () => {
		const cli = makeCli();
		(isPlanFile as Mock).mockReturnValue(false);

		await expect(
			findPlanFileArgs({
				cli,
				inPath: "/mock/path/invalid.txt",
				parentConfig: null,
			}),
		).rejects.toThrow(FilePathError);
	});

	it("throws FilePathError when path is neither a file nor a directory", async () => {
		const cli = makeCli();
		(pathValidating as Mock).mockResolvedValue({
			isValidPath: true,
			isDirectory: false,
			isFile: false,
		});

		await expect(
			findPlanFileArgs({
				cli,
				inPath: "/mock/path/broken",
				parentConfig: null,
			}),
		).rejects.toThrow(FilePathError);
	});

	it("throws FilePathError when directory has no plan files", async () => {
		const cli = makeCli();
		(pathConstructor as Mock).mockResolvedValue("/mock/path");
		(pathValidating as Mock).mockResolvedValue({
			isValidPath: true,
			isDirectory: true,
			isFile: false,
		});
		(findAllPlanFile as Mock).mockResolvedValue([]);

		await expect(
			findPlanFileArgs({
				cli,
				inPath: "/mock/path",
				parentConfig: null,
			}),
		).rejects.toThrow(FilePathError);
	});

	it("calls pathConstructor with cli and inPath", async () => {
		const cli = makeCli();

		await findPlanFileArgs({
			cli,
			inPath: "/mock/path/file.plan.json",
			parentConfig: null,
		});

		expect(pathConstructor).toHaveBeenCalledWith(
			cli,
			"/mock/path/file.plan.json",
		);
	});

	it("passes parentConfig to isPlanFile", async () => {
		const cli = makeCli();
		const parentConfig = { planExt: "yaml" };

		await findPlanFileArgs({
			cli,
			inPath: "/mock/path/file.plan.yaml",
			parentConfig,
		});

		expect(isPlanFile).toHaveBeenCalledWith(
			cli,
			"/mock/path/file.plan.json",
			parentConfig,
		);
	});
});
