import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "~/const";
import { isConfigFileInFolder } from "./isConfigFileInFolder";

vi.mock("node:fs");

const processTerm = { cwd: () => "/project" } as any;

beforeEach(() => {
	vi.resetAllMocks();
});

describe("isConfigFileInFolder", () => {
	it("returns true when the config file exists", () => {
		(fs.existsSync as Mock).mockReturnValue(true);

		const result = isConfigFileInFolder({ processTerm, config: {} });

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/project", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
		expect(result).toBe(true);
	});

	it("returns false when the config file does not exist", () => {
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = isConfigFileInFolder({ processTerm, config: {} });

		expect(result).toBe(false);
	});

	it("uses custom configFile and configFileExt from config", () => {
		(fs.existsSync as Mock).mockReturnValue(true);

		isConfigFileInFolder({
			processTerm,
			config: { configFile: "my.config", configFileExt: "yaml" },
		});

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/project", "my.config.yaml"),
		);
	});

	it("falls back to CONFIG_FILE when config.configFile is not set", () => {
		(fs.existsSync as Mock).mockReturnValue(false);

		isConfigFileInFolder({ processTerm, config: { configFileExt: "toml" } });

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/project", `${CONFIG_FILE}.toml`),
		);
	});

	it("falls back to CONFIG_FILE_EXT when config.configFileExt is not set", () => {
		(fs.existsSync as Mock).mockReturnValue(false);

		isConfigFileInFolder({ processTerm, config: { configFile: "custom" } });

		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/project", `custom.${CONFIG_FILE_EXT}`),
		);
	});
});
