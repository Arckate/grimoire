import nodePath from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { CONFIG_FILE, ROOTS } from "~/const";
import { FilePathError } from "~/errors";
import { findRoots } from "./findRoots";
import { pathConstructor } from "./pathConstructor";

vi.mock("./findRoots", () => ({
	findRoots: vi.fn(),
}));

const makeCli = (
	initialDirs: Record<string, string> = {},
	config: Record<string, any> = {},
	cwd = "/cwd",
): Cli => {
	const dirs: Record<string, string> = { ...initialDirs };
	return {
		getDir: (key: string) => dirs[key] ?? null,
		getProcessTerm: () => ({ cwd: () => cwd }),
		getConfig: () => config,
		addDirs: (newDirs: Record<string, string>) => {
			Object.assign(dirs, newDirs);
		},
	} as unknown as Cli;
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe("pathConstructor", () => {
	describe(`PARENT ("${ROOTS.PARENT}") paths`, () => {
		it("uses cached PARENT dir when already set in cli", async () => {
			const cli = makeCli({ [ROOTS.PARENT]: "/parent" });

			const result = await pathConstructor(cli, "~/folder");

			expect(result).toBe(nodePath.join("/parent", "/folder"));
			expect(findRoots).not.toHaveBeenCalled();
		});

		it("calls findRoots and caches result when PARENT is not set", async () => {
			(findRoots as Mock).mockReturnValue({ [ROOTS.PARENT]: "/found-parent" });
			const cli = makeCli();

			const result = await pathConstructor(cli, "~/folder");

			expect(result).toBe(nodePath.join("/found-parent", "/folder"));
			expect(findRoots).toHaveBeenCalledTimes(1);
		});

		it("also caches ROOT when findRoots returns both PARENT and ROOT", async () => {
			(findRoots as Mock).mockReturnValue({
				[ROOTS.PARENT]: "/found-parent",
				[ROOTS.ROOT]: "/found-root",
			});
			const cli = makeCli();

			const result = await pathConstructor(cli, "~/folder");

			expect(result).toBe(nodePath.join("/found-parent", "/folder"));
			expect(await pathConstructor(cli, "~~/other")).toBe(
				nodePath.join("/found-root", "/other"),
			);
			expect(findRoots).toHaveBeenCalledTimes(1);
		});

		it("throws FilePathError with custom configFile when PARENT cannot be resolved", async () => {
			(findRoots as Mock).mockReturnValue({});
			const cli = makeCli({}, { configFile: "custom.json" });

			await expect(pathConstructor(cli, "~/folder")).rejects.toThrow(
				new FilePathError(
					`The ${ROOTS.PARENT} option requires at least one 'custom.json' file to be present.`,
				),
			);
		});

		it("throws FilePathError with default CONFIG_FILE when configFile is not set", async () => {
			(findRoots as Mock).mockReturnValue({});
			const cli = makeCli({}, {});

			await expect(pathConstructor(cli, "~/folder")).rejects.toThrow(
				new FilePathError(
					`The ${ROOTS.PARENT} option requires at least one '${CONFIG_FILE}' file to be present.`,
				),
			);
		});
	});

	describe(`ROOT ("${ROOTS.ROOT}") paths`, () => {
		it("uses cached ROOT dir when already set in cli", async () => {
			const cli = makeCli({ [ROOTS.ROOT]: "/root" });

			const result = await pathConstructor(cli, "~~/folder");

			expect(result).toBe(nodePath.join("/root", "/folder"));
			expect(findRoots).not.toHaveBeenCalled();
		});

		it("calls findRoots and caches result when ROOT is not set", async () => {
			(findRoots as Mock).mockReturnValue({ [ROOTS.ROOT]: "/found-root" });
			const cli = makeCli();

			const result = await pathConstructor(cli, "~~/folder");

			expect(result).toBe(nodePath.join("/found-root", "/folder"));
			expect(findRoots).toHaveBeenCalledTimes(1);
		});

		it("throws FilePathError with custom configFile when ROOT cannot be resolved", async () => {
			(findRoots as Mock).mockReturnValue({});
			const cli = makeCli({}, { configFile: "custom.json" });

			await expect(pathConstructor(cli, "~~/folder")).rejects.toThrow(
				new FilePathError(
					`The ${ROOTS.ROOT} option requires at least one 'custom.json' file in which root parameter set to 'true'`,
				),
			);
		});

		it("throws FilePathError with default CONFIG_FILE when configFile is not set", async () => {
			(findRoots as Mock).mockReturnValue({});
			const cli = makeCli({}, {});

			await expect(pathConstructor(cli, "~~/folder")).rejects.toThrow(
				new FilePathError(
					`The ${ROOTS.ROOT} option requires at least one '${CONFIG_FILE}' file in which root parameter set to 'true'`,
				),
			);
		});
	});

	describe("other paths", () => {
		it("returns an absolute path as-is", async () => {
			const cli = makeCli();
			const absolutePath = nodePath.resolve("/home/user/project/file.ts");

			const result = await pathConstructor(cli, absolutePath);

			expect(result).toBe(absolutePath);
		});

		it("joins a relative path with newOldPath", async () => {
			const cli = makeCli();

			const result = await pathConstructor(cli, "relative/path", "/base");

			expect(result).toBe(nodePath.join("/base", "relative/path"));
		});

		it("joins a relative path with cwd when newOldPath is not provided", async () => {
			const cli = makeCli({}, {}, "/cwd");

			const result = await pathConstructor(cli, "relative/path");

			expect(result).toBe(nodePath.join("/cwd", "relative/path"));
		});

		it("returns newOldPath when strPath is falsy", async () => {
			const cli = makeCli();

			const result = await pathConstructor(cli, undefined, "/fallback");

			expect(result).toBe("/fallback");
		});

		it("returns cwd when strPath is falsy and newOldPath is not provided", async () => {
			const cli = makeCli({}, {}, "/cwd");

			const result = await pathConstructor(cli, undefined);

			expect(result).toBe("/cwd");
		});
	});
});
