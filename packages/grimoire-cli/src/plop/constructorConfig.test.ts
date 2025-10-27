import { getGlobalConfig } from "@arckate/grimoire-core/config";
import {
	CLI_FOLDER,
	CONFIG_FILE,
	CONFIG_FILE_EXT,
	CONFIG_FILE_TYPE,
	DESCRIPTION,
	DIRNAMES_FILE,
	GEN_FILE_EXT,
	GEN_FILE_TYPE,
	NAME,
	ROOT_KEY,
	VERSION,
} from "@arckate/grimoire-core/const";
import { describe, expect, it, vi } from "vitest";
import { constructorConfig } from "./constructorConfig";

vi.mock("@arckate/grimoire-core/config", () => ({
	getGlobalConfig: vi.fn(),
}));

describe("constructorConfig", () => {
	it("should return default config when globalConfig is empty", () => {
		// Arrange/Act/Assert
		(getGlobalConfig as any).mockReturnValue({});

		const result = constructorConfig();
		expect(result).toEqual({
			name: NAME,
			description: DESCRIPTION,
			version: VERSION,
			cliFolder: CLI_FOLDER,
			rootKey: ROOT_KEY,
			dirnamesFile: DIRNAMES_FILE,
			configFile: CONFIG_FILE,
			configFileExt: CONFIG_FILE_EXT,
			configFileType: CONFIG_FILE_TYPE,
			genFileExt: GEN_FILE_EXT,
			genFileType: GEN_FILE_TYPE,
			findFile: {},
		});
	});

	it("should merge globalConfig values and transform findFile", () => {
		// Arrange/Act
		(getGlobalConfig as any).mockReturnValue({
			name: "custom",
			description: "desc",
			version: "1.2.3",
			cliFolder: "cli",
			rootKey: "root",
			dirnamesFile: "dirs",
			configFile: "config.json",
			configFileExt: "json",
			configFileType: "object",
			genFileExt: "ts",
			genFileType: "module",
			findFile: {
				js: {
					component: {},
					util: {},
				},
				ts: {
					service: {},
				},
			},
		});

		const result = constructorConfig();

		// Assert
		expect(result.findFile).toEqual({
			js: ["component", "util"],
			ts: ["service"],
		});
		expect(result.name).toBe("custom");
		expect(result.version).toBe("1.2.3");
	});
});
