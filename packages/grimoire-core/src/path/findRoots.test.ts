import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { CONFIG_FILE, CONFIG_FILE_EXT, ROOT_KEY, ROOTS } from "~/const";
import { get, readConfigCliFile } from "~/utils";
import { findRoots } from "./findRoots";

vi.mock("node:fs");
vi.mock("~/utils/readConfigCliFile");
vi.mock("../utils/get");

const makePT = (cwd: string) => ({ cwd: () => cwd }) as any;

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findRoots", () => {
	it("returns both ROOT and PARENT when config file exists and root is true", () => {
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		const result = findRoots({ processTerm: makePT(fakePath), config: {} });

		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("returns only PARENT when root is false", () => {
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: false });
		(get as Mock).mockReturnValue(false);

		const result = findRoots({ processTerm: makePT(fakePath), config: {} });

		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: null,
		});
	});

	it("returns only ROOT when findRoot is true and root is found", () => {
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		const result = findRoots({
			processTerm: makePT(fakePath),
			config: {},
			findRoot: true,
		});

		expect(result).toEqual({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("returns empty roots when no config file is found", () => {
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findRoots({ processTerm: makePT("/project"), config: {} });

		expect(result).toEqual({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: null,
		});
	});

	it("uses custom configFile, configFileExt and rootKey from config", () => {
		const fakePath = "/project";
		const configFile = "custom";
		const configFileExt = "yml";
		const configPath = path.join(fakePath, `${configFile}.${configFileExt}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ customRoot: true });
		(get as Mock).mockImplementation((obj, key) => obj[key]);

		const result = findRoots({
			processTerm: makePT(fakePath),
			config: { configFile, configFileExt, rootKey: "customRoot" },
		});

		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("uses default ROOT_KEY when config.rootKey is not set", () => {
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		findRoots({ processTerm: makePT(fakePath), config: {} });

		expect(get).toHaveBeenCalledWith({ root: true }, ROOT_KEY, {});
	});

	it("falls back to empty object when readConfigCliFile returns undefined", () => {
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue(undefined);
		(get as Mock).mockReturnValue(false);

		const result = findRoots({ processTerm: makePT(fakePath), config: {} });

		expect(get).toHaveBeenCalledWith({}, ROOT_KEY, {});
		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: null,
		});
	});

	it("traverses parent directories until config file is found", () => {
		const rootPath = "/project";
		const childPath = "/project/src/components";
		const configPath = path.join(rootPath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		const result = findRoots({ processTerm: makePT(childPath), config: {} });

		expect(result).toEqual({
			[ROOTS.PARENT]: rootPath,
			[ROOTS.ROOT]: rootPath,
		});
	});
});
