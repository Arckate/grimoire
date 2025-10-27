import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/config/global";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "~/const/config";
import { ROOTS } from "~/const/roots";
import { readConfigCliFile } from "~/utils/readConfigCliFile";
import { get } from "../utils/get";
import { findRoots } from "./findRoots";

vi.mock("node:fs");
vi.mock("~/utils/readConfigCliFile");
vi.mock("../utils/get");

beforeEach(() => {
	vi.resetAllMocks();
	clearGlobalConfig();
});

describe("findRoots", () => {
	it("returns both ROOT and PARENT when config file exists and root is true", () => {
		// Arrange/Act
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		vi.spyOn(process, "cwd").mockReturnValue(fakePath);
		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		const result = findRoots();

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("returns only PARENT when root is false", () => {
		// Arrange/Act
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		vi.spyOn(process, "cwd").mockReturnValue(fakePath);
		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: false });
		(get as Mock).mockReturnValue(false);

		const result = findRoots();

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: null,
		});
	});

	it("returns only ROOT when findRoot is true and root is found", () => {
		// Arrange/Act
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		vi.spyOn(process, "cwd").mockReturnValue(fakePath);
		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ root: true });
		(get as Mock).mockReturnValue(true);

		const result = findRoots(true);

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("returns empty roots when no config file is found", () => {
		// Arrange/Act
		vi.spyOn(process, "cwd").mockReturnValue("/project");
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findRoots();

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: null,
		});
	});

	it("uses custom configFile and rootKey from globalConfig", () => {
		// Arrange/Act
		const fakePath = "/project";
		const configFile = "custom";
		const configFileExt = "yml";
		const configPath = path.join(fakePath, `${configFile}.${configFileExt}`);

		setGlobalConfig({ configFile, configFileExt, rootKey: "customRoot" });

		vi.spyOn(process, "cwd").mockReturnValue(fakePath);
		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue({ customRoot: true });
		(get as Mock).mockImplementation((obj, key) => obj[key]);

		const result = findRoots();

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: fakePath,
		});
	});

	it("uses default value when configCli is undefined", () => {
		// Arrange/Act
		const fakePath = "/project";
		const configPath = path.join(fakePath, `${CONFIG_FILE}.${CONFIG_FILE_EXT}`);

		vi.spyOn(process, "cwd").mockReturnValue(fakePath);
		(fs.existsSync as Mock).mockImplementation((p) => p === configPath);
		(readConfigCliFile as Mock).mockReturnValue(undefined);
		(get as Mock).mockReturnValue(false);

		const result = findRoots();

		// Assert
		expect(result).toEqual({
			[ROOTS.PARENT]: fakePath,
			[ROOTS.ROOT]: null,
		});
	});
});
