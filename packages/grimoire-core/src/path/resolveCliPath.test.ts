import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { ROOTS } from "~/const";
import { findRoots } from "./findRoots";
import { resolveCliPath } from "./resolveCliPath";

vi.mock("./findRoots", () => ({
	findRoots: vi.fn(),
}));

const makeCli = (
	initialDirs: Record<string, string> = {},
	cwd = "/cwd",
): Cli => {
	const dirs: Record<string, string> = { ...initialDirs };
	return {
		getDir: (key: string) => dirs[key] ?? null,
		getProcessTerm: () => ({ cwd: () => cwd }),
		getConfig: () => ({}),
		addDirs: (newDirs: Record<string, string>) => {
			Object.assign(dirs, newDirs);
		},
	} as unknown as Cli;
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe(`resolveCliPath — ROOT ("${ROOTS.ROOT}") paths`, () => {
	it("resolves exact ROOT to cached root dir without calling findRoots", () => {
		const cli = makeCli({ [ROOTS.ROOT]: "/project" });

		const result = resolveCliPath(cli, ROOTS.ROOT);

		expect(result).toBe(path.join("/project", ""));
		expect(findRoots).not.toHaveBeenCalled();
	});

	it("resolves ROOT/sub to cached root + sub", () => {
		const cli = makeCli({ [ROOTS.ROOT]: "/project" });

		const result = resolveCliPath(cli, `${ROOTS.ROOT}/src`);

		expect(result).toBe(path.join("/project", "/src"));
	});

	it("calls findRoots when ROOT is not cached and caches the result", () => {
		(findRoots as Mock).mockReturnValue({ [ROOTS.ROOT]: "/found" });
		const cli = makeCli();

		const first = resolveCliPath(cli, `${ROOTS.ROOT}/src`);
		const second = resolveCliPath(cli, `${ROOTS.ROOT}/other`);

		expect(findRoots).toHaveBeenCalledTimes(1);
		expect(first).toBe(path.join("/found", "/src"));
		expect(second).toBe(path.join("/found", "/other"));
	});

	it("falls back to cwd when ROOT is not found by findRoots", () => {
		(findRoots as Mock).mockReturnValue({});
		const cli = makeCli({}, "/cwd");

		const result = resolveCliPath(cli, `${ROOTS.ROOT}/src`);

		expect(result).toBe(path.join("/cwd", "/src"));
	});
});

describe(`resolveCliPath — PARENT ("${ROOTS.PARENT}") paths`, () => {
	it("resolves exact PARENT to cached parent dir without calling findRoots", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" });

		const result = resolveCliPath(cli, ROOTS.PARENT);

		expect(result).toBe(path.join("/parent", ""));
		expect(findRoots).not.toHaveBeenCalled();
	});

	it("resolves PARENT/sub to cached parent + sub", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" });

		const result = resolveCliPath(cli, `${ROOTS.PARENT}/config`);

		expect(result).toBe(path.join("/parent", "/config"));
	});

	it("calls findRoots when PARENT is not cached and caches the result", () => {
		(findRoots as Mock).mockReturnValue({ [ROOTS.PARENT]: "/resolved" });
		const cli = makeCli();

		const first = resolveCliPath(cli, `${ROOTS.PARENT}/config`);
		const second = resolveCliPath(cli, `${ROOTS.PARENT}/other`);

		expect(findRoots).toHaveBeenCalledTimes(1);
		expect(first).toBe(path.join("/resolved", "/config"));
		expect(second).toBe(path.join("/resolved", "/other"));
	});

	it("falls back to cwd when PARENT is not found by findRoots", () => {
		(findRoots as Mock).mockReturnValue({});
		const cli = makeCli({}, "/cwd");

		const result = resolveCliPath(cli, `${ROOTS.PARENT}/config`);

		expect(result).toBe(path.join("/cwd", "/config"));
	});
});

describe("resolveCliPath — absolute paths", () => {
	it("joins an absolute path with cwd", () => {
		const cli = makeCli({}, "/cwd");

		const result = resolveCliPath(cli, "/absolute/path");

		expect(result).toBe(path.join("/cwd", "/absolute/path"));
	});
});

describe("resolveCliPath — other paths", () => {
	it("returns a relative path as-is", () => {
		const cli = makeCli();

		expect(resolveCliPath(cli, "relative/path")).toBe("relative/path");
	});

	it("returns a plain filename as-is", () => {
		const cli = makeCli();

		expect(resolveCliPath(cli, "file.json")).toBe("file.json");
	});
});
