import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "~/const/config";
import { ROOTS } from "~/const/roots";
import { getGlobalConfig } from "../config/global";
import { getRoots, setRoots } from "../config/roots";
import { readConfigCliFile } from "../utils/readConfigCliFile";
import { findParentConfig } from "./findParentConfig";
import { findRoots } from "./findRoots";

// Mocks
vi.mock("node:fs");
vi.mock("../config/roots", () => ({
	getRoots: vi.fn(),
	setRoots: vi.fn(),
}));
vi.mock("../config/global", () => ({
	getGlobalConfig: vi.fn(),
	setGlobalConfig: vi.fn(),
}));
vi.mock("../utils/readConfigCliFile", () => ({
	readConfigCliFile: vi.fn(),
}));
vi.mock("./findRoots", () => ({
	findRoots: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findParentConfig", () => {
	it("returns config when parent root exists and file exists", () => {
		// Arrange/Act
		(getRoots as Mock).mockReturnValue("/parent");
		(getGlobalConfig as Mock).mockReturnValue({
			configFile: "myConfig",
			configFileExt: "json",
		});
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({ key: "value" });

		const result = findParentConfig();

		// Assert
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/parent", "myConfig.json"),
		);
		expect(readConfigCliFile).toHaveBeenCalled();
		expect(result).toEqual({ key: "value" });
	});

	it("returns config when parent root is resolved via findRoots", () => {
		// Arrange/Act
		(getRoots as Mock).mockReturnValue(undefined);
		(findRoots as Mock).mockReturnValue({ [ROOTS.PARENT]: "/resolved" });
		(getGlobalConfig as Mock).mockReturnValue({});
		(fs.existsSync as Mock).mockReturnValue(true);
		(readConfigCliFile as Mock).mockReturnValue({ config: "resolved" });

		const result = findParentConfig();

		// Assert
		expect(setRoots).toHaveBeenCalledWith({ [ROOTS.PARENT]: "/resolved" });
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/resolved", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
		expect(result).toEqual({ config: "resolved" });
	});

	it("returns null when config file does not exist", () => {
		// Arrange/Act
		(getRoots as Mock).mockReturnValue("/parent");
		(getGlobalConfig as Mock).mockReturnValue({});
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findParentConfig();

		// Assert
		expect(result).toBeNull();
	});

	it("uses default configFile and configFileExt when global config is missing", () => {
		// Arrange/Act
		(getRoots as Mock).mockReturnValue("/parent");
		(getGlobalConfig as Mock).mockReturnValue(undefined);
		(fs.existsSync as Mock).mockReturnValue(false);

		findParentConfig();

		// Assert
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("/parent", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
	});

	it("uses './' as fallback when parent is undefined and findRoots returns nothing", () => {
		// Arrange/Act
		(getRoots as Mock).mockReturnValue(undefined);
		(findRoots as Mock).mockReturnValue({});
		(getGlobalConfig as Mock).mockReturnValue({});
		(fs.existsSync as Mock).mockReturnValue(false);

		const result = findParentConfig();

		// Assert
		expect(fs.existsSync).toHaveBeenCalledWith(
			path.join("./", `${CONFIG_FILE}.${CONFIG_FILE_EXT}`),
		);
		expect(result).toBeNull();
	});
});
