import * as cmdModule from "@arckate/grimoire-core/cmd";
import * as configModule from "@arckate/grimoire-core/config";
import {
	CONF_INITS,
	DEFAULT_INIT,
	INIT_PLOP_FILE,
} from "@arckate/grimoire-core/const";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdInit } from "./cmdInit";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "findPlopPath").mockReturnValue("mocked/plop/path.js");

	vi.spyOn(pathModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(cmdModule, "mergeInitsConfig").mockReturnValue({
		merged: "inits",
	} as any);

	vi.spyOn(configModule, "setInits").mockImplementation(() => {});

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "cmdPlop").mockResolvedValue(undefined);

	vi.spyOn(configModule, "getGlobalConfig").mockReturnValue({
		configFileExt: "json",
		configFileType: "camelCase",
	});

	vi.spyOn(utilsModule, "logger").mockImplementation(() => {});
	vi.spyOn(utilsModule, "logError").mockImplementation(() => {});
	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdInit", () => {
	it("should run cmdPlop with args and exit 0", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {
						plop: "custom-plop.js",
						config: "inits.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(cmdModule.cmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["setup"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: false,
				ignorePrompts: false,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to INIT_PLOP_FILE and CONF_INITS", async () => {
		// Arrange/Act
		await render({
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {}, // no plop or config
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(pathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({ namePlopFile: INIT_PLOP_FILE }),
		);

		expect(pathModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({ nameConfigFile: CONF_INITS }),
		);
	});

	it("should fallback to DEFAULT_INIT and configFileExt when args are empty", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: ["init"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		await renderPromise;

		// Assert
		expect(cmdModule.cmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: [DEFAULT_INIT, "json", "camelCase"],
			}),
		);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["init", "fail"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(utilsModule.logger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(utilsModule.formatError).toHaveBeenCalledWith(expect.any(Error));
		expect(utilsModule.logError).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Formatted error" }),
		);
		expect(exitCode).toBe(1);
	});
});
