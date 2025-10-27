import * as cmdModule from "@arckate/grimoire-core/cmd";
import { CONF_STARTERS, PLOP_FILE } from "@arckate/grimoire-core/const";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdStart } from "./cmdStart";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "findConfig").mockImplementation((async ({
		nameConfigFile,
	}) => {
		if (nameConfigFile === "starter.json") {
			return { starter: "config" };
		}
		return {};
	}) as any);
	vi.spyOn(pathModule, "findPlopPath").mockImplementation(() => {
		return "mocked/plop/path.js";
	});

	vi.spyOn(cmdModule, "mergeInitsConfig").mockReturnValue({
		merged: "inits",
	} as any);
	vi.spyOn(cmdModule, "extractAllGeneratorsConfig").mockReturnValue([
		{ name: "api" },
		{ name: "cli" },
	] as any);
	vi.spyOn(cmdModule, "findStarterGeneratorConfig").mockReturnValue([
		{ name: "cli", config: {} },
	] as any);
	vi.spyOn(cmdModule, "extractAllStarter").mockReturnValue([
		{ name: "cli" },
	] as any);
	vi.spyOn(cmdModule, "mergeStarterConfig").mockReturnValue({
		starter: "merged",
	} as any);
	vi.spyOn(cmdModule, "constructorPlop").mockImplementation((async (
		params: any,
	) => {
		if (params.args[0] === "bad") {
			throw new Error("Mocked failure");
		}
		// simulate success
	}) as any);
	vi.spyOn(utilsModule, "logger").mockImplementation(() => {});
	vi.spyOn(utilsModule, "logError").mockImplementation(() => {});
	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdStart", () => {
	it("should run constructorPlop and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["start", "cli", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						plop: "plopfile.js",
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(exitCode).toBe(0);
	});

	it("should catch error, log it, and exit with code 1", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["start", "bad"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						plop: "plopfile.js",
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(utilsModule.logger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(utilsModule.formatError).toHaveBeenCalledWith(expect.any(Error));
		expect(utilsModule.logError).toHaveBeenCalledWith(
			expect.objectContaining({
				error: "Formatted error",
			}),
		);
		expect(exitCode).toBe(1);
	});

	it("should use PLOP_FILE when config.plop is undefined", async () => {
		// Arrange/Act
		await render({
			argv: ["start", "cli"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(pathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({
				namePlopFile: PLOP_FILE,
			}),
		);
	});

	it("should use CONF_STARTERS when config.config is undefined", async () => {
		// Arrange/ Act
		await render({
			argv: ["start", "cli"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						// no config key
						plop: "plopfile.js",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(pathModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				nameConfigFile: CONF_STARTERS,
			}),
		);
	});

	it("should use CONF_STARTERS when config.config is undefined", async () => {
		// Arrange/ Act
		await render({
			argv: ["start", "cli", "[", "]", "--", "--test", "test"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						// no config key
						plop: "plopfile.js",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(pathModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				nameConfigFile: CONF_STARTERS,
			}),
		);
	});
});
