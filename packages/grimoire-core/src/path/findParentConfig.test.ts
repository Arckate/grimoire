import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import {
	CONFIG_FILE,
	CONFIG_FILE_EXT,
	PLAN_EXT,
	PLAN_TYPE,
	ROOTS,
} from "~/const";
import { readConfigCliFile } from "~/utils";
import { findParentConfig } from "./findParentConfig";
import { findRoots } from "./findRoots";

vi.mock("node:fs");
vi.mock("../utils/readConfigCliFile", () => ({
	readConfigCliFile: vi.fn(),
}));
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
		addGlobals: vi.fn(),
	} as unknown as Cli;
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findParentConfig", () => {
	it("returns config when PARENT dir is already set in cli", () => {
		const cli = makeCli(
			{ [ROOTS.PARENT]: "/parent" },
			{ configFile: "myConfig", configFileExt: "json" },
		);
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({ key: "value" });

		const result = findParentConfig(cli);

		expect(findRoots).not.toHaveBeenCalled();
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/parent", "myConfig.json"),
		);
		expect(readConfigCliFile).toHaveBeenCalled();
		expect(result).toEqual({ key: "value" });
	});

	it("calls findRoots and caches result when PARENT is not set", () => {
		const cli = makeCli();
		(findRoots as Mock).mockReturnValue({ [ROOTS.PARENT]: "/resolved" });
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({ config: "resolved" });

		const result = findParentConfig(cli);

		expect(findRoots).toHaveBeenCalledTimes(1);
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/resolved", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
		expect(result).toEqual({ config: "resolved" });
	});

	it("returns null when config file does not exist", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" });
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findParentConfig(cli);

		expect(result).toBeNull();
	});

	it("uses default CONFIG_FILE and CONFIG_FILE_EXT when config has none", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" }, {});
		(fs.existsSync as Mock).mockReturnValue(false);

		findParentConfig(cli);

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/parent", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
	});

	it("uses './' as fallback path when PARENT cannot be resolved", () => {
		const cli = makeCli();
		(findRoots as Mock).mockReturnValue({});
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findParentConfig(cli);

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("./", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
		expect(result).toBeNull();
	});

	it("calls addGlobals with default PLAN_EXT and PLAN_TYPE when parentConfig has none", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" });
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({ key: "value" });

		findParentConfig(cli);

		expect(cli.addGlobals).toHaveBeenCalledWith({
			currentPlanExt: PLAN_EXT,
			currentPlanType: PLAN_TYPE,
		});
	});

	it("calls addGlobals with planExt and planType from parentConfig when present", () => {
		const cli = makeCli({ [ROOTS.PARENT]: "/parent" });
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({
			planExt: "yaml",
			planType: "snakeCase",
		});

		findParentConfig(cli);

		expect(cli.addGlobals).toHaveBeenCalledWith({
			currentPlanExt: "yaml",
			currentPlanType: "snakeCase",
		});
	});
});
